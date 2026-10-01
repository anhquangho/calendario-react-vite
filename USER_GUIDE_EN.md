# Calendario — User guide (clients / team)

For end users: planners, coordinators, and DK Events team members.  
Updated: 26/09/2026 — events and tasks are stored in **Supabase** (data survives refresh).

> **Important:** Everyone shares one workspace. Valid changes are saved to the cloud.  
> Some UI actions are **not finished yet** (see section 12). Admins manage accounts using the docs in the **`SUPABASE`** folder on Google Drive (section 15).

---

## 1. Accessing the app

### Team / clients (deployed URL or internal link)

1. Open the Calendario URL provided by your administrator.
2. Enter the **email** and **password** they gave you.
3. Click **Sign in**.
4. Wait briefly if you see `Checking access...`.
5. You should reach **DK Events Calendario**.

If you see **Access denied**: Supabase sign-in worked, but you are not an active row in `team_members`, or you were deactivated. Contact an admin — **do not** edit the database yourself.

Sessions usually persist after `Ctrl + R`. Switching Chrome tabs and returning should **not** replace the calendar with `Checking access...` (report to support if it still happens).

### Developers (local run)

From the Calendario project folder:

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Open the URL Vite prints (often `http://127.0.0.1:5173/`). Requires `.env.local` with Supabase variables from an admin.

---

## 2. Interface overview

| Label | Meaning |
| --- | --- |
| `Calendario` | Month calendar |
| `Lista` | Task table |
| `Eventos` | Event list and progress |
| `+ Nueva tarea` | Add a task |
| `+ Nuevo evento` / `+ Agregar evento` | Add an event |
| `Tarea` | Task name (when editing: base title only, not `- event name`) |
| `Evento` | Related event |
| `Responsable` | Owner |
| `Estado` | Status |
| `Fecha` | Due / work date |
| `Comentarios` | Notes |
| `Editar` | Edit |
| `Eliminar` | Delete |
| `Guardar` / `Guardar cambios` | Save to Supabase |
| `Cancelar` | Cancel / close |

**Task statuses**

| Value | Meaning | Filter label |
| --- | --- | --- |
| `Not started` | Not started | `No iniciado` |
| `In progress` | In progress | `En progreso` |
| `Completed` | Completed | `Completado` |

**Available owners:** Denisse, Danielle, Jeroen, Tuty, Novia, Novios, Corp.

On the calendar, labels look like **`Task name - Event name`**. That is display-only; when editing, change only the task title field.

---

## 3. Calendar and day detail

1. Open **Calendario**.
2. Use `‹` and `›` to change month (gray arrows).
3. On each day cell:
   - Today: day number in an orange circle.
   - Events: blue labels (🎉).
   - Tasks: colors by owner; up to 3 lines, then `+N más`.
4. Click a day to view/edit tasks, change status quickly, or **+ Agregar tarea aquí**.
5. Close with `×` or click the dimmed backdrop.

Weeks start on **Sunday** (`Dom`). Tasks on the calendar respect the **filters** above.

---

## 4. Create a new event

### 4.1. Bodas — 53 auto-generated tasks

1. **+ Nuevo evento** (or **Eventos → + Agregar evento**).
2. **Nombre del evento:** a clear name (prefer unique names when possible).
3. **Tipo → Bodas**.
4. **Fecha del evento:** wedding date.
5. Open **Ver las 53 tareas que se generarán** to preview.
6. Click **Crear y generar 53 tareas** and wait for save to finish.
7. Check **Eventos** (53 tareas) and **Lista** / other months on the calendar.

Due dates spread across many months **before** the event (plus some after). **`Tareas este mes`** counts only tasks in the **month you are viewing**, not all 53.

### 4.2. Corporativo — 46 auto-generated tasks

1. Open the new-event form.
2. Enter name and date.
3. **Tipo → Corporativo**.
4. Confirm the preview shows **46 tareas**.
5. **Crear y generar 46 tareas**.

This replaces the old behavior where Corporativo did not auto-generate tasks.

---

## 5. Delete an event

1. **Eventos** → **Eliminar** on the event.
2. Read the task count in the confirmation → **Sí, eliminar**.

Deletion is on Supabase and **cannot be undone**. All tasks for that event are removed (cascade).

---

## 6. Edit event — not for production use yet

**Eventos** has **Editar**, but changes are **not saved to Supabase**. After **Guardar cambios**, a refresh (`Ctrl + R`) restores the old data.

**Do not use Editar event** on real client events until your technical contact confirms persistence is enabled. For name/date changes on live data, contact admin/support.

---

## 7. Add a manual task

- **+ Nueva tarea** — default date is today.
- On the calendar: pick a day → **+ Agregar tarea aquí**.

Fill **Tarea**, **Evento**, **Responsable**, **Estado**, **Fecha**, **Comentarios** → **Agregar** (while saving: `Agregando...`).

You need at least one event first. Do **not** type the `- event name` suffix in the task title field.

---

## 8. Edit, change status, delete tasks

### Full edit

**Lista** (click a row) or day detail → **Editar tarea** → **Guardar** (`Guardando...`).

### Quick status change

Day detail → **Estado** dropdown — saves to Supabase immediately.

### Delete

**Editar tarea** → **Eliminar** — no second confirmation; permanent on the cloud.

After important changes, use **Ctrl + R** to confirm data still looks correct.

---

## 9. Filters

Three dropdowns at the top:

- **Todos los responsables**
- **Todos los eventos**
- **Todos los estados**

You can combine them. Reset each to `Todos los ...` to clear filters.

- **Lista:** all matching dates, sorted by date.
- **Calendario:** tasks in the open month only.
- **Eventos** and 🎉 markers are **not** hidden by filters.

There is no free-text search box yet.

**Note:** two events with the **same name** can confuse event-based filters. Prefer distinct names.

---

## 10. Stats and progress

| Label | Meaning |
| --- | --- |
| `Tareas este mes` | Total tasks in the calendar month being viewed (after filters) |
| `No iniciadas` / `En progreso` / `Completadas` | Status breakdown; the three sum to `Tareas este mes` |

In **Eventos**, each event’s % bar uses **all** its tasks, independent of filters.

---

## 11. Team usage — what clients should know

| Topic | Guidance |
| --- | --- |
| Shared data | All active members see the same events/tasks after load or refresh. |
| Realtime | **Not available.** If someone else edits, **Ctrl + R** to refresh (your own CRUD reloads data). |
| Sign out on calendar | **No** sign-out button on the main UI. Admins deactivate users in Supabase if needed. |
| Passwords | Admins set temporary passwords; in-app forgot/change password is **not complete** — contact admin. |
| Excel | No Excel import/export in the app. Bodas/Corporativo templates live in Supabase. |
| Visual reminders | **Recordatorios** shows unfinished tasks across all months, respecting the selected filters. **Vencidas** = before today; **Hoy** = today; **Próximos 7 días** = tomorrow through 7 days ahead. Click a task to edit it. Completed tasks are excluded. |
| Backups | Admins handle Supabase backups; users cannot export from the app. |

---

## 12. Not implemented — not treated as bugs

- Persistent **Editar event**.
- Email/push reminders, Excel sync, in-app team management, realtime, sign-out on the calendar.
- Perfect handling of duplicate event names in filters.

---

## 13. Suggested trial flow (test data)

Use the `TEST -` prefix so you can delete afterward.

1. Create `TEST - Boda` (Bodas) → 53 tasks → refresh → still there.
2. Create `TEST - Corp` (Corporativo) → 46 tasks → refresh → still there.
3. **+ Nueva tarea** on a test event → edit → status → delete → refresh.
4. **Eventos** → delete test events.

---

## 14. Common situations

| Situation | What to do |
| --- | --- |
| Cannot find a new task | Check filters, calendar month, open **Lista** with filters cleared. |
| Stats show 0 but Lista has rows | Stats are for the month shown on **Calendario** only. |
| Bodas has 53 tasks but few in the event month | Normal — tasks are spread across earlier months. |
| `Access denied` | Contact admin (`team_members`). |
| Red error after save | Screenshot, note time and action, send to admin/support. |
| Edited event, lost after refresh | Expected today — edit event is not persisted. |
| Tab switch shows `Checking access...` | Report to support if it persists on the latest build. |

---

## 15. Related documents

Documentation on **Google Drive**, folder **`Documentation for project use`**:

### `Calendario` (root)

| File | Purpose |
| --- | --- |
| `00_START_HERE.md` | Entry point — which document to read first |

### `CalendarProject`

| File | Purpose |
| --- | --- |
| `USER_GUIDE_EN.md` | Calendario user guide (English) — this document |
| `GUIA_USUARIO_ES.md` | User guide (Español) |
| `HUONG_DAN_SU_DUNG.md` | User guide (Tiếng Việt) |
| `PROJECT_DOCUMENTATION_EN.md` | Project overview (English) |
| `PROJECT_DOCUMENTATION_ES.md` | Project overview (Español) |

### `SUPABASE`

| File / folder | Purpose |
| --- | --- |
| `GUIA_ADMIN_SUPABASE.md` | Supabase administration (Español) |
| `SUPABASE_ADMIN_GUIDE.md` | Supabase administration (English) |
| `README.md` | Schema, migrations, and setup summary |
| `migrations/` | SQL migrations (tables, RLS, templates, RPC) |
| `tests/` | Schema check scripts |

---

## 16. Developer commands (optional for clients)

```powershell
npm run build
npm run lint
```

`build` produces `dist`. `lint` runs ESLint.
