# Calendario — Project State

## Goal

Build a usable online event/wedding planning application where users can manage events and their related tasks reliably.

## Current architecture

- React 19 + Vite.
- Main application logic is currently concentrated in `src/App.jsx`.
- Events and tasks are stored in React state.
- Reloading the page resets data.
- No backend/database authentication is integrated yet.
- Wedding/event tasks are currently associated using the event name in some flows.

## Current priority

Move the application from local in-memory state toward real persistent data.

Priority order:

1. Add persistent data storage.
2. Model the wedding/event → task relationship using stable IDs instead of event names.
3. Make CRUD behavior correct for events and their related tasks.
4. Prepare the application for online/team usage.
5. Excel import/export comes later.

## Current task

Integrate Supabase Auth and the deployed persistence layer into the React UI.

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
- Data disappears after refresh.

## Next action

Configure the React Supabase client and authentication flow, then replace the
in-memory event/task reads and writes incrementally. Keep the current UI intact.

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

The frontend is not connected to Supabase yet, so runtime behavior still uses
React state and reloads still reset UI changes.

The legacy workbook has now been compared with the React source. Its `To Do`
sheet contains operational status, comments, and owner overrides that the
current seed-data implementation does not preserve.
