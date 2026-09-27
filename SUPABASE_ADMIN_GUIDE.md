# Calendario — Supabase administration guide

Handover document for the Calendario owner and administrators.

Last updated: 26/09/2026  
Current project: `calendario-demo`  
Backend: Supabase PostgreSQL + Supabase Auth + Row Level Security (RLS)

> This guide is for managing the backend. Day-to-day work with events and tasks
> should be done in the Calendario application, not by editing Supabase tables
> directly.

## 1. What Supabase manages

Supabase stores and protects:

- accounts that can sign in;
- the list of authorized members;
- Bodas and Corporativo task templates;
- events;
- tasks for each event;
- RLS access rules;
- the function that creates an event and generates its tasks automatically.

The React app displays and changes this data through the Supabase API. There is
no separate PHP server and Docker is not required for production.

## 2. What to do in Calendario vs Supabase

| Operation | Recommended place |
|---|---|
| Create, edit, or delete a task | Calendario app |
| Change status, date, owner, or comments | Calendario app |
| Create a Bodas or Corporativo event | Calendario app |
| Delete a test event | Calendario app |
| Create an access account | Supabase Authentication |
| Authorize or deactivate a member | `team_members` table |
| Inspect data when something is wrong | Supabase Table Editor |
| Review access or database errors | Logs / Observability |
| Change schema, policies, functions, or templates | Technical administrator only |

## 3. Accessing the project

1. Open <https://supabase.com/dashboard>.
2. Sign in with the owner account.
3. Select the correct organization.
4. Open the `calendario-demo` project.
5. Confirm the project status is `Healthy`.

Do not share the owner account password or 2FA code. To grant admin access to
someone else, invite them to the organization with the minimum role required.

## 4. Data structure

### `team_members`

Allowlist of authorized users. A successful sign-in is not enough: the user
must also have an active row in this table.

| Field | Purpose |
|---|---|
| `user_id` | User UUID in Authentication |
| `display_name` | Member’s visible name |
| `is_active` | `true` allows access; `false` blocks it |
| `invited_by` | Admin who added the member; may be empty |
| `created_at` | Automatic creation timestamp |

### `task_templates`

Templates used when creating events:

- 53 tasks for `Bodas`;
- 46 tasks for `Corporativo`.

`days_before` defines the task date relative to the event date:

- positive value: before the event;
- `0`: same day as the event;
- negative value: after the event.

Changing a template only affects events created afterward. It does not
automatically update tasks on existing events.

### `events`

Stores each event’s name, date, and type. Every event has a stable UUID. Two
events may share the same name but remain separate records.

### `tasks`

Stores each real calendar task:

- related event (`event_id`);
- title;
- owner;
- due date (`due_date`);
- status;
- comments;
- source template when the task was auto-generated.

Deleting an event also deletes its related tasks. This cannot be undone from the
app.

## 5. Create and authorize a new user

The current version uses email and password. Onboarding requires two steps:

### Step A — Create the user in Authentication

1. Open `Authentication`.
2. Go to `Users`.
3. Choose add or create user.
4. Enter the person’s email.
5. Set a secure temporary password.
6. Confirm creation.
7. Open the user and copy their UUID (`User ID`).

Send the temporary password over a secure channel. Do not put it in a public
document or store it in source code.

> The app does not yet include a full password recovery or change screen. Do
> not use email invite/reset flows until the domain and redirect URLs are
> configured and tested.

### Step B — Authorize them in `team_members`

1. Open `Table Editor`.
2. Select the `team_members` table.
3. Choose `Insert row` / `Add row`.
4. Fill in:
   - `user_id`: UUID copied from Authentication;
   - `display_name`: person’s name;
   - `is_active`: `true`;
   - `invited_by`: may be empty;
   - `created_at`: leave the automatic value.
5. Save the row.
6. Ask the user to sign in to Calendario.

If Step B is missing, the user can authenticate but will see `Access denied`.

## 6. Deactivate or reactivate a user

### Deactivate

1. Open `Table Editor` → `team_members`.
2. Find the row by `display_name` or `user_id`.
3. Set `is_active` to `false`.
4. Save.
5. Ask the user to reload or close the app.

RLS policies will stop allowing them to read or modify events and tasks.

### Reactivate

Set `is_active` back to `true` and ask the user to reload the app.

### Do not delete historical users

Do not delete a user from Authentication if they created events or tasks.
Records store `created_by` and the database protects that relationship. To
revoke access, always use `is_active = false`.

## 7. Inspect data without breaking it

Open `Table Editor` and select a table.

Safe operations:

- sort or filter rows;
- review dates, owners, status, and comments;
- verify an event has its tasks;
- confirm a member is active.

Operations a non-technical user should not perform:

- change UUIDs;
- manually edit `event_id`, `template_id`, or `created_by`;
- delete events or tasks directly in Table Editor;
- run SQL copied from the internet;
- bulk-edit `task_templates`;
- modify functions, triggers, foreign keys, or policies;
- disable RLS.

If normal operational data needs to change, do it in Calendario.

## 8. Security and API keys

Go to `Project Settings` → `API Keys` only when configuring the frontend or
rotating credentials.

### Key allowed in the frontend

The app uses:

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_PUBLISHABLE_KEY`.

The publishable key may be used in the browser because RLS controls what each
authenticated user can do.

### Keys that must never reach the browser

Never put these on GitHub, Cloudflare Pages, Vite files, or public messages:

- database password;
- secret key;
- `service_role` key;
- Supabase Personal Access Token.

Secret/service-role keys bypass RLS and belong only in trusted backend
processes.

### RLS

Tables `team_members`, `task_templates`, `events`, and `tasks` have RLS enabled.
Do not disable RLS to fix a permission error. First verify:

1. the user exists in Authentication;
2. their UUID is correct in `team_members`;
3. `is_active` is `true`;
4. the user has reloaded the app.

## 9. Review errors and activity

### Login issues

1. Open `Authentication` → `Users` and confirm the email exists.
2. Confirm the user has an active row in `team_members`.
3. Review `Authentication` → `Audit Logs` for login, logout, password, and
   token events.

Logs may take a short time to appear.

### Event or task issues

1. Open `Logs` or `Observability`.
2. Look for recent API/Postgres/Auth errors.
3. Record:
   - approximate time;
   - affected user;
   - action taken;
   - message and HTTP status;
   - browser Network/Console screenshots.
4. Pass this information to the technical administrator.

Do not try to fix database errors by disabling policies or deleting related
rows.

## 10. Backups and recovery

### Free project

The Free plan should not be treated as automatic production backup. Supabase
recommends periodic exports with Supabase CLI via `db dump`, stored outside
Supabase.

A technical administrator should run this. Example policy:

- before a major change: manual backup;
- during real use: periodic backup outside Supabase;
- keep migrations in the GitHub repository.

### Paid project

Pro, Team, and Enterprise plans include daily backups with different retention.
See `Database` → `Backups`.

Never restore a backup without:

1. confirming which data will be lost;
2. notifying users about downtime;
3. saving a backup of the current state;
4. having technical support available.

Deleting a project is irreversible and removes associated backups.

## 11. Free project paused for inactivity

Supabase may pause a Free project with insufficient activity. The owner will
receive warning emails.

To resume:

1. open Supabase Dashboard;
2. select the organization and paused project;
3. choose `Resume project`;
4. wait until it is healthy again;
5. test login, data read, and creating a test task.

Paid projects are not auto-paused for inactivity.

## 12. Template changes

Templates are configuration data and should not be edited like day-to-day tasks.

Before changing a template, document:

- event type;
- old and new title;
- default owner;
- days before/after count;
- change date;
- person who authorized it.

After the change, create a test event and confirm the count and dates of
generated tasks. Do not use a real client event for testing.

## 13. Handing the project to the client

The client should create their own Supabase account and organization.

Recommended process:

1. client creates the organization and sets up billing;
2. temporarily invites the developer;
3. current owner transfers `calendario-demo` to the client’s organization from
   `Project Settings` → `General`;
4. review plan, region, limits, and permissions;
5. test the deployed application;
6. client becomes Owner;
7. client reduces or removes developer access when support ends.

Transfer requires the current owner to be Owner of the source organization and
a member of the destination organization. Review integrations and restrictions
shown by Supabase before confirming.

Do not hand over a personal account or password. Transfer the project or use
organization invitations.

## 14. Monthly owner checklist

- [ ] Project shows `Healthy`.
- [ ] No pause, limit, or billing emails pending.
- [ ] Only authorized people are active in `team_members`.
- [ ] No unknown users in Authentication.
- [ ] No repeated errors in Logs/Observability.
- [ ] Recent backup exists outside Supabase if still on Free.
- [ ] GitHub keeps migrations and the deployed version.
- [ ] No secret/service-role key exposed in frontend or repositories.

## 15. Incident procedure

1. Do not delete tables, users, or the project.
2. Do not disable RLS.
3. Record time, user, action, and error message.
4. Capture Calendario, Network, and Supabase Logs screenshots.
5. If improper access is suspected, set `is_active` to `false` for the affected
   user.
6. Contact the technical administrator.
7. Restore data only from a confirmed backup.

## 16. Official links

- User management: <https://supabase.com/docs/guides/auth/managing-user-data>
- API keys: <https://supabase.com/docs/guides/getting-started/api-keys>
- Row Level Security: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Auth Audit Logs: <https://supabase.com/docs/guides/auth/audit-logs>
- Database backups: <https://supabase.com/docs/guides/platform/backups>
- Free project pausing: <https://supabase.com/docs/guides/platform/free-project-pausing>
- Project transfer: <https://supabase.com/docs/guides/platform/project-transfer>
- Platform access control: <https://supabase.com/docs/guides/platform/access-control>

## 17. Support details to fill in at handover

| Item | Value |
|---|---|
| Supabase owner |  |
| Organization |  |
| Project name | `calendario-demo` |
| Plan | Free / Pro / other |
| Region |  |
| Calendario URL |  |
| GitHub repository |  |
| Technical contact |  |
| Handover date |  |
