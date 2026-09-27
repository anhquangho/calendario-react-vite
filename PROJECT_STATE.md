# Calendario — Project State

## Goal

Build a usable online event/wedding planning application where users can manage events and their related tasks reliably.

## Current architecture

- React 19 + Vite.
- Main application logic is currently concentrated in `src/App.jsx`.
- Supabase Auth and the `team_members` membership gate protect the application.
- Events, tasks, and active task templates are read from Supabase after login.
- Creating an event uses the transactional `create_event_with_tasks` RPC;
  deleting an event also persists to Supabase.
- The UI still stores mapped cloud rows in React state while the page is open.

## Current priority

Move the application from local in-memory state toward real persistent data.

Priority order:

1. Add persistent data storage.
2. Model the wedding/event → task relationship using stable IDs instead of event names.
3. Make CRUD behavior correct for events and their related tasks.
4. Prepare the application for online/team usage.
5. Excel import/export comes later.

## Current task

Verify the newly connected task CRUD against Supabase, then resolve event edit.

## Backend decision

The selected stack is:

- React + Vite frontend.
- Supabase managed PostgreSQL database.
- Supabase Auth for individual team access.
- Row Level Security (RLS) for authorization.

Current working assumptions:

- Approximately 10 team members.
- All invited team members can add, edit, and delete data.
- The legacy Excel workbook is a business/task template only; do not migrate
  its existing events, statuses, comments, or task instances.
- Reminders are visual calendar indicators only. No email, WhatsApp, or push
  notifications in the first version.
- Corporate task generation is included in scope; its exact template behavior
  must be reflected in the schema and implementation.

This is a technical implementation decision, not a claim that the client chose
Supabase by name.

## Important constraint

Do not redesign the existing UI while implementing persistence unless required.

Preserve current working behavior while migrating the data model.

## Known technical debt

- Event/task relationships based on event names can break when duplicate names exist.
- Application logic is heavily concentrated in `src/App.jsx`.
- Task CRUD is connected in source but still needs manual browser verification.
- Event editing is still local-only and requires a confirmed due-date rule.

## Next action

Execute the manual checklist in `TEST_CASES.md`, prioritizing task
add/edit/status/delete with a reload after each operation.

Customer backend operations and handover are documented in
`GUIA_ADMIN_SUPABASE.md` (Spanish). It covers member access, safe table review,
RLS/API-key security, logs, backups, Free-plan pausing, and project transfer.
Bodas event creation has already been verified in the user's SSH-forwarded
browser. Corporativo creation (46 tasks) is not yet manually verified. Do not
persist event editing until the due-date rule for manually adjusted tasks is
confirmed.

Before enabling normal application access, establish the first authenticated
team member because the RLS policies intentionally deny users who are not in
`public.team_members`. Run the remaining SQL checks in
`supabase/tests/initial_schema_checks.sql` when a suitable SQL client is
available. Detailed investigation findings are tracked in
`TIEN_DO_DIEU_TRA.md`.

## Last known status

The frontend is running and the existing event/task workflow works locally.

Supabase project `calendario-demo` is active in `us-east-1`. The repository is
linked to the project and migration `202609250001_initial_schema.sql` has been
applied successfully. Local and remote migration histories match, and remote
database lint reports no schema errors.

The frontend now has a Supabase client, AuthGate, team-membership check, and
services for templates, events, and tasks. Active templates, events, and tasks
are fetched after login. Both Bodas and Corporativo templates are shown in the
new-event preview. Event creation/deletion and task add/edit/status/delete are
connected to Supabase. Event editing is not yet persisted. The old wedding
template remains only as a temporary fallback if the cloud request fails.

`npm run build` and ESLint for the touched frontend files pass. The user has
manually verified the Bodas persistence flow in the existing SSH-forwarded
browser: the UI showed 53 generated tasks, the event/tasks appeared on the
calendar, and they remained after refresh. Automated browser access remains
unavailable because its `127.0.0.1` is on a different machine.

Task forms now use stable event UUIDs and save the raw task title separately
from the UI-only `title - event name` label. Every successful mutation reloads
the cloud data before closing its modal. Build and full-project lint pass; task
CRUD still requires the same manual refresh test in the SSH-forwarded browser.

The legacy workbook has now been compared with the React source. Its `To Do`
sheet contains operational status, comments, and owner overrides that the
current seed-data implementation does not preserve.

AuthGate no longer resets membership or unmounts the calendar on
`TOKEN_REFRESHED` / same-user session recovery. Switching Chrome tabs should
keep the calendar mounted. `npm run build` and `npm run lint` pass after this
fix. Manual tab-switch verification in the user's Chrome is still required.
