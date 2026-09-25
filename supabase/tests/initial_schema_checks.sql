do $$
declare
  wedding_template_count integer;
  corporate_template_count integer;
  rls_table_count integer;
  policy_count integer;
begin
  select count(*) into wedding_template_count
  from public.task_templates
  where event_type = 'Bodas';

  if wedding_template_count <> 53 then
    raise exception 'Expected 53 Bodas templates, found %', wedding_template_count;
  end if;

  select count(*) into corporate_template_count
  from public.task_templates
  where event_type = 'Corporativo';

  if corporate_template_count <> 46 then
    raise exception 'Expected 46 Corporativo templates, found %', corporate_template_count;
  end if;

  select count(*) into rls_table_count
  from pg_catalog.pg_class as relation
  join pg_catalog.pg_namespace as namespace
    on namespace.oid = relation.relnamespace
  where namespace.nspname = 'public'
    and relation.relname in ('team_members', 'task_templates', 'events', 'tasks')
    and relation.relrowsecurity = true;

  if rls_table_count <> 4 then
    raise exception 'Expected RLS on 4 tables, found %', rls_table_count;
  end if;

  select count(*) into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in ('team_members', 'task_templates', 'events', 'tasks');

  if policy_count <> 10 then
    raise exception 'Expected 10 RLS policies, found %', policy_count;
  end if;

  if has_table_privilege('anon', 'public.events', 'select')
    or has_table_privilege('anon', 'public.tasks', 'select')
    or has_table_privilege('anon', 'public.task_templates', 'select')
    or has_table_privilege('anon', 'public.team_members', 'select') then
    raise exception 'Anonymous role unexpectedly has table read access';
  end if;
end;
$$;

select
  'initial schema checks passed' as result,
  count(*) filter (where event_type = 'Bodas') as wedding_templates,
  count(*) filter (where event_type = 'Corporativo') as corporate_templates
from public.task_templates;
