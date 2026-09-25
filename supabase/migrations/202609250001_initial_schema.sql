begin;

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) > 0),
  is_active boolean not null default true,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.team_members is
  'Allowlist of authenticated users who can access the shared Calendario workspace.';

create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('Bodas', 'Corporativo')),
  sort_order smallint not null check (sort_order > 0),
  days_before integer not null,
  title text not null check (char_length(btrim(title)) > 0),
  default_owner text not null check (char_length(btrim(default_owner)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_type, sort_order),
  unique (event_type, title)
);

comment on table public.task_templates is
  'Wedding and corporate defaults copied into independent task rows when an event is created.';
comment on column public.task_templates.days_before is
  'Positive values are before the event; negative values are after the event.';

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) > 0),
  event_date date not null,
  event_type text not null check (event_type in ('Bodas', 'Corporativo')),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.events is
  'Stable event records. Duplicate names are allowed because tasks reference events by UUID.';

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  template_id uuid references public.task_templates(id) on delete restrict,
  title text not null check (char_length(btrim(title)) > 0),
  owner text not null check (char_length(btrim(owner)) > 0),
  due_date date not null,
  status text not null default 'Not started'
    check (status in ('Not started', 'In progress', 'Completed')),
  comments text not null default '',
  is_generated boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_generated or template_id is not null)
);

comment on table public.tasks is
  'Independent task instances. Editing a task never changes its source template.';

create unique index tasks_one_copy_per_template_per_event
  on public.tasks (event_id, template_id)
  where template_id is not null;

create index events_event_date_idx on public.events (event_date);
create index tasks_event_id_idx on public.tasks (event_id);
create index tasks_due_date_idx on public.tasks (due_date);
create index tasks_status_idx on public.tasks (status);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.prevent_created_by_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by then
    raise exception 'created_by cannot be changed';
  end if;
  return new;
end;
$$;

create trigger task_templates_set_updated_at
before update on public.task_templates
for each row execute function private.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function private.set_updated_at();

create trigger events_preserve_created_by
before update on public.events
for each row execute function private.prevent_created_by_change();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function private.set_updated_at();

create trigger tasks_preserve_created_by
before update on public.tasks
for each row execute function private.prevent_created_by_change();

create function private.is_team_member()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.team_members
    where user_id = (select auth.uid())
      and is_active = true
  );
$$;

revoke execute on function private.is_team_member() from public;
grant execute on function private.is_team_member() to authenticated;

alter table public.team_members enable row level security;
alter table public.task_templates enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;

revoke all on table public.team_members from anon, authenticated;
revoke all on table public.task_templates from anon, authenticated;
revoke all on table public.events from anon, authenticated;
revoke all on table public.tasks from anon, authenticated;

grant select on table public.team_members to authenticated;
grant select on table public.task_templates to authenticated;
grant select, insert, update, delete on table public.events to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;

create policy "Team members can view membership"
on public.team_members
for select
to authenticated
using ((select private.is_team_member()));

create policy "Team members can view task templates"
on public.task_templates
for select
to authenticated
using ((select private.is_team_member()));

create policy "Team members can view events"
on public.events
for select
to authenticated
using ((select private.is_team_member()));

create policy "Team members can create events"
on public.events
for insert
to authenticated
with check (
  (select private.is_team_member())
  and created_by = (select auth.uid())
);

create policy "Team members can update events"
on public.events
for update
to authenticated
using ((select private.is_team_member()))
with check ((select private.is_team_member()));

create policy "Team members can delete events"
on public.events
for delete
to authenticated
using ((select private.is_team_member()));

create policy "Team members can view tasks"
on public.tasks
for select
to authenticated
using ((select private.is_team_member()));

create policy "Team members can create tasks"
on public.tasks
for insert
to authenticated
with check (
  (select private.is_team_member())
  and created_by = (select auth.uid())
);

create policy "Team members can update tasks"
on public.tasks
for update
to authenticated
using ((select private.is_team_member()))
with check ((select private.is_team_member()));

create policy "Team members can delete tasks"
on public.tasks
for delete
to authenticated
using ((select private.is_team_member()));

create function public.create_event_with_tasks(
  p_name text,
  p_event_date date,
  p_event_type text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_event_id uuid;
begin
  if not (select private.is_team_member()) then
    raise exception 'Only active team members can create events';
  end if;

  if char_length(btrim(p_name)) = 0 then
    raise exception 'Event name is required';
  end if;

  if p_event_type not in ('Bodas', 'Corporativo') then
    raise exception 'Unsupported event type: %', p_event_type;
  end if;

  insert into public.events (name, event_date, event_type, created_by)
  values (btrim(p_name), p_event_date, p_event_type, (select auth.uid()))
  returning id into new_event_id;

  insert into public.tasks (
    event_id,
    template_id,
    title,
    owner,
    due_date,
    status,
    comments,
    is_generated,
    created_by
  )
  select
    new_event_id,
    template.id,
    template.title,
    template.default_owner,
    p_event_date - template.days_before,
    'Not started',
    '',
    true,
    (select auth.uid())
  from public.task_templates as template
  where template.event_type = p_event_type
    and template.is_active = true
  order by template.sort_order;

  return new_event_id;
end;
$$;

revoke execute on function public.create_event_with_tasks(text, date, text) from public, anon;
grant execute on function public.create_event_with_tasks(text, date, text) to authenticated;

insert into public.task_templates (
  event_type,
  sort_order,
  days_before,
  title,
  default_owner
)
values
  ('Bodas', 1, 240, 'MUA', 'Novia'),
  ('Bodas', 2, 240, 'Ceremonia', 'Novios'),
  ('Bodas', 3, 240, 'Recepción', 'Novios'),
  ('Bodas', 4, 240, 'DJ', 'Denisse'),
  ('Bodas', 5, 240, 'Foto', 'Denisse'),
  ('Bodas', 6, 240, '2nd Shooter', 'Denisse'),
  ('Bodas', 7, 240, 'Video', 'Denisse'),
  ('Bodas', 8, 240, 'Tarjetas', 'Tuty'),
  ('Bodas', 9, 240, 'Mandar Contrato', 'Jeroen'),
  ('Bodas', 10, 240, 'Abrir Chat', 'Tuty'),
  ('Bodas', 11, 240, 'Abrir Folder', 'Tuty'),
  ('Bodas', 12, 240, 'Guestlist', 'Tuty'),
  ('Bodas', 13, 240, 'Reservar Decoración Iglesia', 'Danielle'),
  ('Bodas', 14, 240, 'Reservar Decoración Recepcion', 'Danielle'),
  ('Bodas', 15, 210, 'Padre/Pastor', 'Novios'),
  ('Bodas', 16, 210, 'Tarimas', 'Jeroen'),
  ('Bodas', 17, 210, 'Contrato Firmado', 'Jeroen'),
  ('Bodas', 18, 210, 'Comenzar Invites', 'Tuty'),
  ('Bodas', 19, 190, 'Pastel', 'Denisse'),
  ('Bodas', 20, 190, 'Postres', 'Denisse'),
  ('Bodas', 21, 190, 'Iniciar Doc Legales para casarse', 'Novios'),
  ('Bodas', 22, 180, 'Audiovisual', 'Jeroen'),
  ('Bodas', 23, 180, 'Musica de la Iglesia', 'Denisse'),
  ('Bodas', 24, 180, 'Entretenimiento', 'Denisse'),
  ('Bodas', 25, 180, 'Extras Carnaval', 'Denisse'),
  ('Bodas', 26, 180, 'Prueba de Pastel', 'Denisse'),
  ('Bodas', 27, 180, 'Start Licor', 'Jeroen'),
  ('Bodas', 28, 180, 'Reservar Audio', 'Jeroen'),
  ('Bodas', 29, 180, 'Cotizacion Audio', 'Danielle'),
  ('Bodas', 30, 180, 'Coffee Station', 'Jeroen'),
  ('Bodas', 31, 180, 'Start Plano', 'Danielle'),
  ('Bodas', 32, 150, 'Finish Plano', 'Danielle'),
  ('Bodas', 33, 150, 'Meseros Adicionales', 'Jeroen'),
  ('Bodas', 34, 150, 'Décor - Telas', 'Danielle'),
  ('Bodas', 35, 140, 'Generador', 'Jeroen'),
  ('Bodas', 36, 120, 'Prueba de Flores', 'Danielle'),
  ('Bodas', 37, 120, 'Prueba de Menu', 'Danielle'),
  ('Bodas', 38, 120, 'Prueba de Cocteles', 'Jeroen'),
  ('Bodas', 39, 120, 'Diseño Pista', 'Denisse'),
  ('Bodas', 40, 119, 'Pedido Muebles', 'Danielle'),
  ('Bodas', 41, 119, 'Pedido Flores', 'Danielle'),
  ('Bodas', 42, 90, 'Plano 3D', 'Denisse'),
  ('Bodas', 43, 60, 'Logistica Montaje', 'Jeroen'),
  ('Bodas', 44, 60, 'Viaticos DK Events', 'Tuty'),
  ('Bodas', 45, 60, 'RSVP', 'Tuty'),
  ('Bodas', 46, 30, 'DK Lights', 'Jeroen'),
  ('Bodas', 47, 14, 'Logistica Desmontaje', 'Jeroen'),
  ('Bodas', 48, 10, 'Reunion Foto y Video', 'Denisse'),
  ('Bodas', 49, 10, 'Reunion DJ', 'Denisse'),
  ('Bodas', 50, -5, 'Cierre Evento', 'Jeroen'),
  ('Bodas', 51, 30, 'Llenar Datos de boda', 'Denisse'),
  ('Bodas', 52, 30, 'Reunion de Agenda', 'Danielle'),
  ('Bodas', 53, 7, 'Compartir Agenda', 'Denisse'),
  ('Corporativo', 1, 240, 'Venue', 'Corp'),
  ('Corporativo', 2, 240, 'DJ', 'Denisse'),
  ('Corporativo', 3, 240, 'Foto', 'Denisse'),
  ('Corporativo', 4, 240, 'Video', 'Denisse'),
  ('Corporativo', 5, 240, 'Tarjetas', 'Tuty'),
  ('Corporativo', 6, 240, 'Mandar Contrato', 'Jeroen'),
  ('Corporativo', 7, 240, 'Abrir Chat', 'Tuty'),
  ('Corporativo', 8, 240, 'Abrir Folder', 'Tuty'),
  ('Corporativo', 9, 240, 'Guestlist', 'Tuty'),
  ('Corporativo', 10, 240, 'Reservar Decoración Recepcion', 'Danielle'),
  ('Corporativo', 11, 210, 'Tarimas', 'Jeroen'),
  ('Corporativo', 12, 210, 'Contrato Firmado', 'Jeroen'),
  ('Corporativo', 13, 210, 'Comenzar Invites', 'Tuty'),
  ('Corporativo', 14, 190, 'Postres', 'Denisse'),
  ('Corporativo', 15, 180, 'Audiovisual', 'Jeroen'),
  ('Corporativo', 16, 180, 'Entretenimiento', 'Denisse'),
  ('Corporativo', 17, 180, 'Extras Carnaval', 'Denisse'),
  ('Corporativo', 18, 180, 'Start Licor', 'Jeroen'),
  ('Corporativo', 19, 180, 'Reservar Audio', 'Jeroen'),
  ('Corporativo', 20, 180, 'Cotizacion Audio', 'Danielle'),
  ('Corporativo', 21, 180, 'Coffee Station', 'Jeroen'),
  ('Corporativo', 22, 180, 'Start Plano', 'Danielle'),
  ('Corporativo', 23, 150, 'Finish Plano', 'Danielle'),
  ('Corporativo', 24, 150, 'Meseros Adicionales', 'Jeroen'),
  ('Corporativo', 25, 150, 'Décor - Telas', 'Danielle'),
  ('Corporativo', 26, 140, 'Generador', 'Jeroen'),
  ('Corporativo', 27, 120, 'Prueba de Flores', 'Danielle'),
  ('Corporativo', 28, 120, 'Prueba de Menu', 'Danielle'),
  ('Corporativo', 29, 120, 'Prueba de Cocteles', 'Jeroen'),
  ('Corporativo', 30, 120, 'Diseño Pista', 'Denisse'),
  ('Corporativo', 31, 119, 'Pedido Muebles', 'Danielle'),
  ('Corporativo', 32, 119, 'Pedido Flores', 'Danielle'),
  ('Corporativo', 33, 90, 'Plano 3D', 'Denisse'),
  ('Corporativo', 34, 60, 'Logistica Montaje', 'Jeroen'),
  ('Corporativo', 35, 60, 'Viaticos DK Events', 'Tuty'),
  ('Corporativo', 36, 60, 'RSVP', 'Tuty'),
  ('Corporativo', 37, 30, 'DK Lights', 'Jeroen'),
  ('Corporativo', 38, 14, 'Logistica Desmontaje', 'Jeroen'),
  ('Corporativo', 39, 10, 'Reunion Foto y Video', 'Denisse'),
  ('Corporativo', 40, 10, 'Reunion DJ', 'Denisse'),
  ('Corporativo', 41, -5, 'Cierre Evento', 'Jeroen'),
  ('Corporativo', 42, 30, 'Llenar Datos de boda', 'Denisse'),
  ('Corporativo', 43, 30, 'Reunion de Agenda', 'Danielle'),
  ('Corporativo', 44, 7, 'Compartir Agenda', 'Denisse'),
  ('Corporativo', 45, 100, 'Material POP', 'Danielle'),
  ('Corporativo', 46, 90, 'Impresiones POP', 'Denisse')
on conflict (event_type, sort_order) do update
set
  days_before = excluded.days_before,
  title = excluded.title,
  default_owner = excluded.default_owner,
  is_active = true,
  updated_at = now();

commit;
