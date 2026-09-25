import { useState, useMemo } from "react";

// ─── Date helpers ────────────────────────────────────────────────────────────
const EXCEL_EPOCH = new Date(1899, 11, 30);
function excelToDate(serial) {
  const d = new Date(EXCEL_EPOCH);
  d.setDate(d.getDate() + serial);
  return d;
}
function dateToExcel(date) {
  return Math.round((date - EXCEL_EPOCH) / 86400000);
}
function formatDate(date) {
  return date.toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" });
}
function toInputDate(serial) {
  return excelToDate(serial).toISOString().split("T")[0];
}
function fromInputDate(str) {
  return dateToExcel(new Date(str + "T12:00:00"));
}

// ─── Bodas task template (Col A = daysBeefore, Col B = task, Col C = owner) ──
const BODAS_TEMPLATE = [
  { daysBefore: 240, task: "MUA",                          owner: "Novia"    },
  { daysBefore: 240, task: "Ceremonia",                    owner: "Novios"   },
  { daysBefore: 240, task: "Recepción",                    owner: "Novios"   },
  { daysBefore: 240, task: "DJ",                           owner: "Denisse"  },
  { daysBefore: 240, task: "Foto",                         owner: "Denisse"  },
  { daysBefore: 240, task: "2nd Shooter",                  owner: "Denisse"  },
  { daysBefore: 240, task: "Video",                        owner: "Denisse"  },
  { daysBefore: 240, task: "Tarjetas",                     owner: "Tuty"     },
  { daysBefore: 240, task: "Mandar Contrato",              owner: "Jeroen"   },
  { daysBefore: 240, task: "Abrir Chat",                   owner: "Tuty"     },
  { daysBefore: 240, task: "Abrir Folder",                 owner: "Tuty"     },
  { daysBefore: 240, task: "Guestlist",                    owner: "Tuty"     },
  { daysBefore: 240, task: "Reservar Decoración Iglesia",  owner: "Danielle" },
  { daysBefore: 240, task: "Reservar Decoración Recepcion",owner: "Danielle" },
  { daysBefore: 210, task: "Padre/Pastor",                 owner: "Novios"   },
  { daysBefore: 210, task: "Tarimas",                      owner: "Jeroen"   },
  { daysBefore: 210, task: "Contrato Firmado",             owner: "Jeroen"   },
  { daysBefore: 210, task: "Comenzar Invites",             owner: "Tuty"     },
  { daysBefore: 190, task: "Pastel",                       owner: "Denisse"  },
  { daysBefore: 190, task: "Postres",                      owner: "Denisse"  },
  { daysBefore: 190, task: "Iniciar Doc Legales para casarse", owner: "Novios" },
  { daysBefore: 180, task: "Audiovisual",                  owner: "Jeroen"   },
  { daysBefore: 180, task: "Musica de la Iglesia",         owner: "Denisse"  },
  { daysBefore: 180, task: "Entretenimiento",              owner: "Denisse"  },
  { daysBefore: 180, task: "Extras Carnaval",              owner: "Denisse"  },
  { daysBefore: 180, task: "Prueba de Pastel",             owner: "Denisse"  },
  { daysBefore: 180, task: "Start Licor",                  owner: "Jeroen"   },
  { daysBefore: 180, task: "Reservar Audio",               owner: "Jeroen"   },
  { daysBefore: 180, task: "Cotizacion Audio",             owner: "Danielle" },
  { daysBefore: 180, task: "Coffee Station",               owner: "Jeroen"   },
  { daysBefore: 180, task: "Start Plano",                  owner: "Danielle" },
  { daysBefore: 150, task: "Finish Plano",                 owner: "Danielle" },
  { daysBefore: 150, task: "Meseros Adicionales",          owner: "Jeroen"   },
  { daysBefore: 150, task: "Décor - Telas",                owner: "Danielle" },
  { daysBefore: 140, task: "Generador",                    owner: "Jeroen"   },
  { daysBefore: 120, task: "Prueba de Flores",             owner: "Danielle" },
  { daysBefore: 120, task: "Prueba de Menu",               owner: "Danielle" },
  { daysBefore: 120, task: "Prueba de Cocteles",           owner: "Jeroen"   },
  { daysBefore: 120, task: "Diseño Pista",                 owner: "Denisse"  },
  { daysBefore: 119, task: "Pedido Muebles",               owner: "Danielle" },
  { daysBefore: 119, task: "Pedido Flores",                owner: "Danielle" },
  { daysBefore: 90,  task: "Plano 3D",                     owner: "Denisse"  },
  { daysBefore: 60,  task: "Logistica Montaje",            owner: "Jeroen"   },
  { daysBefore: 60,  task: "Viaticos DK Events",           owner: "Tuty"     },
  { daysBefore: 60,  task: "RSVP",                         owner: "Tuty"     },
  { daysBefore: 30,  task: "DK Lights",                    owner: "Jeroen"   },
  { daysBefore: 30,  task: "Llenar Datos de boda",         owner: "Denisse"  },
  { daysBefore: 30,  task: "Reunion de Agenda",            owner: "Danielle" },
  { daysBefore: 14,  task: "Logistica Desmontaje",         owner: "Jeroen"   },
  { daysBefore: 10,  task: "Reunion Foto y Video",         owner: "Denisse"  },
  { daysBefore: 10,  task: "Reunion DJ",                   owner: "Denisse"  },
  { daysBefore: 7,   task: "Compartir Agenda",             owner: "Denisse"  },
  { daysBefore: -5,  task: "Cierre Evento",                owner: "Jeroen"   },
];

function generateTasksForEvent(eventName, eventDateSerial) {
  return BODAS_TEMPLATE.map((tmpl, i) => ({
    id: `${eventName}-${i}-${Date.now()}`,
    date: eventDateSerial - tmpl.daysBefore,
    task: `${tmpl.task} - ${eventName}`,
    owner: tmpl.owner,
    event: eventName,
    status: "Not started",
    comments: "",
    generated: true,
  }));
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bgPrimary:    "#ffffff",
  bgSecondary:  "#f7f7f6",
  bgTertiary:   "#f0efee",
  textPrimary:  "#1a1a18",
  textSecondary:"#6b6b68",
  textTertiary: "#9b9b98",
  borderPrimary:"#c8c8c4",
  borderSecondary:"#ddddd8",
  borderTertiary:"#e8e8e4",
  accent:       "#D85A30",
  danger:       "#E24B4A",
  fontSans:     "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const OWNERS = ["Denisse","Danielle","Jeroen","Tuty","Novia","Novios","Corp"];
const OWNER_COLORS = {
  Denisse: "#7F77DD", Danielle: "#1D9E75", Jeroen: "#378ADD",
  Tuty: "#D85A30", Novia: "#D4537E", Novios: "#BA7517", Corp: "#888780",
};
const STATUS_COLORS = {
  "Completed":  "#1D9E75",
  "In progress":"#BA7517",
  "Not started":"#888780",
};
const DAYS   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ─── Seed events ─────────────────────────────────────────────────────────────
const SEED_EVENTS = [
  { name: "Cabas Rodriguez",   date: new Date(2026, 6, 18), type: "Bodas" },
  { name: "Zelaya Irias",      date: new Date(2026, 6, 25), type: "Bodas" },
  { name: "Pinel Zambrano",    date: new Date(2026, 7,  1), type: "Bodas" },
  { name: "Kafie Facusse",     date: new Date(2026, 8,  5), type: "Bodas" },
  { name: "Tigo 30 años",      date: new Date(2026, 7, 22), type: "Corporativo" },
];

function buildSeedTasks() {
  let tasks = [];
  let uid = 0;
  SEED_EVENTS.filter(e => e.type === "Bodas").forEach(ev => {
    const serial = dateToExcel(ev.date);
    BODAS_TEMPLATE.forEach(tmpl => {
      tasks.push({
        id: uid++,
        date: serial - tmpl.daysBefore,
        task: `${tmpl.task} - ${ev.name}`,
        owner: tmpl.owner,
        event: ev.name,
        status: "Not started",
        comments: "",
      });
    });
  });
  return tasks;
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────
const inputStyle = {
  background: C.bgSecondary, border: `0.5px solid ${C.borderSecondary}`,
  borderRadius: 8, padding: "6px 10px", fontSize: 13,
  color: C.textPrimary, width: "100%",
};
function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4, display: "block" }}>{label}</label>
      {children}
    </div>
  );
}
function CloseBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.textSecondary, lineHeight: 1, padding: 0 }}>×</button>
  );
}
function Modal({ children, onClose, wide }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
      <div style={{ background: C.bgPrimary, borderRadius: 12, border: `0.5px solid ${C.borderTertiary}`, width: wide ? "min(700px,95vw)" : "min(520px,95vw)", maxHeight: "90vh", overflow: "auto", padding: "1.25rem" }}>
        {children}
      </div>
    </div>
  );
}
function Btn({ onClick, color, children, disabled, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: color || C.accent, color: "#fff", border: "none", borderRadius: 8,
      padding: small ? "5px 12px" : "7px 16px", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: small ? 12 : 13, fontWeight: 500, opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}
function OutlineBtn({ onClick, children, small }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: `0.5px solid ${C.borderSecondary}`, borderRadius: 8,
      padding: small ? "5px 12px" : "7px 16px", cursor: "pointer",
      fontSize: small ? 12 : 13, color: C.textSecondary,
    }}>{children}</button>
  );
}
function Badge({ label, color }) {
  return <span style={{ borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 500, background: color + "22", color }}>{label}</span>;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view,  setView]  = useState("calendar"); // calendar | list | events

  // Events catalogue
  const [events, setEvents] = useState(SEED_EVENTS.map((e, i) => ({
    id: i, name: e.name, date: dateToExcel(e.date), type: e.type,
  })));

  // Tasks
  const [tasks, setTasks] = useState(() => buildSeedTasks());

  // Filters
  const [filterOwner,  setFilterOwner]  = useState("All");
  const [filterEvent,  setFilterEvent]  = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modals
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [editingTask,  setEditingTask]  = useState(null);
  const [addTaskForm,  setAddTaskForm]  = useState(null);
  const [eventModal,   setEventModal]   = useState(null); // null | {mode:"add"} | {mode:"edit", event}
  const [deleteEventConfirm, setDeleteEventConfirm] = useState(null);

  // ── Derived ──
  const firstDay   = new Date(year, month, 1);
  const lastDay    = new Date(year, month + 1, 0);
  const startSer   = dateToExcel(firstDay);
  const endSer     = dateToExcel(lastDay);

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (filterOwner  !== "All" && t.owner  !== filterOwner)  return false;
    if (filterEvent  !== "All" && t.event  !== filterEvent)  return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    return true;
  }), [tasks, filterOwner, filterEvent, filterStatus]);

  const tasksByDay = useMemo(() => {
    const map = {};
    filteredTasks.forEach(t => { (map[t.date] = map[t.date] || []).push(t); });
    return map;
  }, [filteredTasks]);

  const calendarDays = useMemo(() => {
    const pad  = firstDay.getDay();
    const days = Array(pad).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push({ date, serial: dateToExcel(date), day: d });
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  const monthTasks = filteredTasks.filter(t => t.date >= startSer && t.date <= endSer);
  const stats = useMemo(() => ({
    total:      monthTasks.length,
    notStarted: monthTasks.filter(t => t.status === "Not started").length,
    inProg:     monthTasks.filter(t => t.status === "In progress").length,
    done:       monthTasks.filter(t => t.status === "Completed").length,
  }), [monthTasks]);

  const isToday = s => {
    const d = excelToDate(s);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };

  // ── Task mutations ──
  const updateStatus  = (id, status) => setTasks(p => p.map(t => t.id === id ? {...t, status} : t));
  const saveTask      = (id, upd)    => { setTasks(p => p.map(t => t.id === id ? {...t, ...upd} : t)); setEditingTask(null); };
  const deleteTask    = id           => { setTasks(p => p.filter(t => t.id !== id)); setEditingTask(null); };
  const addTask       = form         => { setTasks(p => [...p, {...form, id: Date.now()}]); setAddTaskForm(null); };

  // ── Event mutations ──
  const addEvent = (name, dateSerial, type) => {
    const id = Date.now();
    setEvents(p => [...p, { id, name, date: dateSerial, type }]);
    if (type === "Bodas") {
      const newTasks = BODAS_TEMPLATE.map((tmpl, i) => ({
        id: `${id}-${i}`,
        date:  dateSerial - tmpl.daysBefore,
        task:  `${tmpl.task} - ${name}`,
        owner: tmpl.owner,
        event: name,
        status: "Not started",
        comments: "",
      }));
      setTasks(p => [...p, ...newTasks]);
    }
    setEventModal(null);
  };

  const editEvent = (oldEvent, newName, newDateSerial, newType) => {
    // Update event record
    setEvents(p => p.map(e => e.id === oldEvent.id ? {...e, name: newName, date: newDateSerial, type: newType} : e));
    // Rename + redate all tasks belonging to this event
    setTasks(p => p.map(t => {
      if (t.event !== oldEvent.name) return t;
      // Re-derive task name: strip old event name suffix, append new name
      const baseName = t.task.replace(` - ${oldEvent.name}`, "");
      // Re-derive date offset: find matching template entry by base task name
      const tmpl = BODAS_TEMPLATE.find(tm => tm.task === baseName);
      const newDate = tmpl ? newDateSerial - tmpl.daysBefore : t.date + (newDateSerial - oldEvent.date);
      return { ...t, event: newName, task: `${baseName} - ${newName}`, date: newDate };
    }));
    setEventModal(null);
  };

  const deleteEvent = ev => {
    setEvents(p => p.filter(e => e.id !== ev.id));
    setTasks(p => p.filter(t => t.event !== ev.name));
    setDeleteEventConfirm(null);
  };

  // ── Nav ──
  const prevMonth = () => month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setMonth(0), setYear(y => y+1)) : setMonth(m => m+1);

  const allEventNames = events.map(e => e.name);

  // ── Render ──
  return (
    <>
      <style>{`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${C.bgTertiary}; font-family: ${C.fontSans}; color: ${C.textPrimary}; } select,input,button { font-family: inherit; }`}</style>
      <div style={{ minHeight: "100vh", background: C.bgTertiary, paddingBottom: 40 }}>

        {/* ── Header ── */}
        <div style={{ background: C.bgPrimary, borderBottom: `0.5px solid ${C.borderTertiary}`, padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.5px" }}>
            DK <span style={{ color: C.accent }}>Events</span>{" "}
            <span style={{ fontSize: 14, color: C.textSecondary, fontWeight: 400 }}>Calendario</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["calendar","Calendario"],["list","Lista"],["events","Eventos"]].map(([v,l]) => (
              <button key={v} onClick={() => setView(v)} style={{
                background: view===v ? C.bgSecondary : "none",
                border: `0.5px solid ${view===v ? C.borderPrimary : C.borderSecondary}`,
                borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                fontSize: 13, color: view===v ? C.textPrimary : C.textSecondary, fontWeight: view===v ? 500 : 400,
              }}>{l}</button>
            ))}
            <Btn onClick={() => setAddTaskForm({ date: dateToExcel(today), task: "", owner: "Denisse", event: allEventNames[0]||"", status: "Not started", comments: "" })}>+ Nueva tarea</Btn>
            <Btn color="#378ADD" onClick={() => setEventModal({ mode: "add" })}>+ Nuevo evento</Btn>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem" }}>

          {/* ── Filters ── */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} style={inputStyle}>
              <option value="All">Todos los responsables</option>
              {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)} style={inputStyle}>
              <option value="All">Todos los eventos</option>
              {events.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
              <option value="All">Todos los estados</option>
              <option value="Not started">No iniciado</option>
              <option value="In progress">En progreso</option>
              <option value="Completed">Completado</option>
            </select>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: "1.25rem" }}>
            {[
              { n: stats.total,      lbl: "Tareas este mes",  color: C.textPrimary },
              { n: stats.notStarted, lbl: "No iniciadas",     color: "#888780"     },
              { n: stats.inProg,     lbl: "En progreso",      color: "#BA7517"     },
              { n: stats.done,       lbl: "Completadas",      color: "#1D9E75"     },
            ].map((s,i) => (
              <div key={i} style={{ background: C.bgSecondary, borderRadius: 8, padding: "0.75rem 1rem", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 500, color: s.color, lineHeight: 1.2 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* ── CALENDAR VIEW ── */}
          {view === "calendar" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
                <button onClick={prevMonth} style={{ background: "none", border: `0.5px solid ${C.borderSecondary}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>‹</button>
                <div style={{ fontSize: 22, fontWeight: 500, minWidth: 220, textAlign: "center" }}>{MONTHS[month]} {year}</div>
                <button onClick={nextMonth} style={{ background: "none", border: `0.5px solid ${C.borderSecondary}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>›</button>
              </div>
              <div style={{ background: C.bgPrimary, borderRadius: 12, border: `0.5px solid ${C.borderTertiary}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: C.bgSecondary }}>
                  {DAYS.map(d => <div key={d} style={{ textAlign: "center", padding: "8px 4px", fontSize: 12, fontWeight: 500, color: C.textSecondary, borderRight: `0.5px solid ${C.borderTertiary}` }}>{d}</div>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                  {calendarDays.map((cell, i) => {
                    if (!cell) return <div key={i} style={{ minHeight: 90, borderRight: `0.5px solid ${C.borderTertiary}`, borderBottom: `0.5px solid ${C.borderTertiary}`, background: C.bgSecondary }} />;
                    const cellTasks = tasksByDay[cell.serial] || [];
                    const shown = cellTasks.slice(0, 3);
                    const more  = cellTasks.length - shown.length;
                    const sel   = selectedDay?.serial === cell.serial;
                    // Also show event markers
                    const dayEvents = events.filter(e => e.date === cell.serial);
                    return (
                      <div key={i} onClick={() => setSelectedDay(sel ? null : cell)}
                        style={{ minHeight: 90, borderRight: `0.5px solid ${C.borderTertiary}`, borderBottom: `0.5px solid ${C.borderTertiary}`, padding: "6px 4px", cursor: "pointer", background: sel ? "rgba(216,90,48,0.06)" : C.bgPrimary }}>
                        <div style={{ marginBottom: 3 }}>
                          {isToday(cell.serial)
                            ? <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: C.accent, borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{cell.day}</span>
                            : <span style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary }}>{cell.day}</span>}
                        </div>
                        {dayEvents.map(ev => (
                          <span key={ev.id} style={{ fontSize: 10, borderRadius: 4, padding: "2px 5px", marginBottom: 2, display: "block", background: "#378ADD22", color: "#378ADD", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🎉 {ev.name}</span>
                        ))}
                        {shown.map(t => (
                          <span key={t.id} style={{ fontSize: 10, borderRadius: 4, padding: "2px 5px", marginBottom: 2, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: OWNER_COLORS[t.owner]+"22", color: OWNER_COLORS[t.owner] }}>{t.task}</span>
                        ))}
                        {more > 0 && <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 2 }}>+{more} más</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── LIST VIEW ── */}
          {view === "list" && (
            <div style={{ background: C.bgPrimary, borderRadius: 12, border: `0.5px solid ${C.borderTertiary}`, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Fecha","Tarea","Evento","Responsable","Estado","Comentarios"].map(h => (
                    <th key={h} style={{ textAlign: "left", fontSize: 12, color: C.textSecondary, fontWeight: 500, padding: "8px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filteredTasks.sort((a,b) => a.date - b.date).map(t => (
                    <tr key={t.id} onClick={() => setEditingTask({...t})} style={{ cursor: "pointer" }}>
                      <td style={{ fontSize: 13, padding: "8px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}>{formatDate(excelToDate(t.date))}</td>
                      <td style={{ fontSize: 13, padding: "8px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}>{t.task}</td>
                      <td style={{ fontSize: 13, padding: "8px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}>{t.event}</td>
                      <td style={{ padding: "8px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}><Badge label={t.owner} color={OWNER_COLORS[t.owner]||"#888"} /></td>
                      <td style={{ padding: "8px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}><Badge label={t.status} color={STATUS_COLORS[t.status]} /></td>
                      <td style={{ fontSize: 12, padding: "8px 10px", borderBottom: `0.5px solid ${C.borderTertiary}`, color: C.textSecondary }}>{t.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── EVENTS VIEW ── */}
          {view === "events" && (
            <div style={{ background: C.bgPrimary, borderRadius: 12, border: `0.5px solid ${C.borderTertiary}`, overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: `0.5px solid ${C.borderTertiary}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>Eventos ({events.length})</div>
                <Btn small onClick={() => setEventModal({ mode: "add" })}>+ Agregar evento</Btn>
              </div>
              {events.map(ev => {
                const evTasks  = tasks.filter(t => t.event === ev.name);
                const done     = evTasks.filter(t => t.status === "Completed").length;
                const progress = evTasks.length ? Math.round((done / evTasks.length) * 100) : 0;
                return (
                  <div key={ev.id} style={{ padding: "1rem 1.25rem", borderBottom: `0.5px solid ${C.borderTertiary}`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{ev.name}</div>
                      <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
                        {ev.type} · {formatDate(excelToDate(ev.date))} · {evTasks.length} tareas
                      </div>
                      <div style={{ marginTop: 6, height: 4, background: C.bgTertiary, borderRadius: 99, width: 180 }}>
                        <div style={{ height: 4, borderRadius: 99, background: "#1D9E75", width: `${progress}%` }} />
                      </div>
                      <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{progress}% completado</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <OutlineBtn small onClick={() => setEventModal({ mode: "edit", event: ev })}>Editar</OutlineBtn>
                      <Btn small color={C.danger} onClick={() => setDeleteEventConfirm(ev)}>Eliminar</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Day detail modal ── */}
        {selectedDay && (
          <Modal onClose={() => setSelectedDay(null)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{formatDate(selectedDay.date)}</div>
              <CloseBtn onClick={() => setSelectedDay(null)} />
            </div>
            {/* Event markers for this day */}
            {events.filter(e => e.date === selectedDay.serial).map(ev => (
              <div key={ev.id} style={{ background: "#378ADD11", border: `0.5px solid #378ADD44`, borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontSize: 13, color: "#378ADD", fontWeight: 500 }}>
                🎉 Evento: {ev.name} ({ev.type})
              </div>
            ))}
            {(tasksByDay[selectedDay.serial]||[]).length === 0 && events.filter(e=>e.date===selectedDay.serial).length===0 && (
              <p style={{ color: C.textSecondary, fontSize: 13 }}>No hay tareas para este día.</p>
            )}
            {(tasksByDay[selectedDay.serial]||[]).map(t => (
              <div key={t.id} onClick={() => setEditingTask({...t})}
                style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: `0.5px solid ${C.borderTertiary}`, cursor: "pointer" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.task}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{t.event}</div>
                  {t.comments && <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{t.comments}</div>}
                </div>
                <Badge label={t.owner} color={OWNER_COLORS[t.owner]||"#888"} />
                <select value={t.status} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); updateStatus(t.id, e.target.value); }}
                  style={{ ...inputStyle, width: "auto", padding: "4px 8px", fontSize: 12 }}>
                  <option>Not started</option><option>In progress</option><option>Completed</option>
                </select>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <Btn small onClick={() => { setSelectedDay(null); setAddTaskForm({ date: selectedDay.serial, task: "", owner: "Denisse", event: allEventNames[0]||"", status: "Not started", comments: "" }); }}>+ Agregar tarea aquí</Btn>
            </div>
          </Modal>
        )}

        {/* ── Edit task modal ── */}
        {editingTask && (
          <Modal onClose={() => setEditingTask(null)}>
            <EditTaskModal task={editingTask} events={allEventNames} onSave={saveTask} onDelete={deleteTask} onClose={() => setEditingTask(null)} />
          </Modal>
        )}

        {/* ── Add task modal ── */}
        {addTaskForm && (
          <Modal onClose={() => setAddTaskForm(null)}>
            <AddTaskModal form={addTaskForm} onChange={setAddTaskForm} events={allEventNames} onAdd={addTask} onClose={() => setAddTaskForm(null)} />
          </Modal>
        )}

        {/* ── Add/Edit event modal ── */}
        {eventModal && (
          <Modal onClose={() => setEventModal(null)} wide>
            <EventModal
              mode={eventModal.mode}
              existing={eventModal.event}
              template={BODAS_TEMPLATE}
              onAdd={addEvent}
              onEdit={editEvent}
              onClose={() => setEventModal(null)}
            />
          </Modal>
        )}

        {/* ── Delete event confirm ── */}
        {deleteEventConfirm && (
          <Modal onClose={() => setDeleteEventConfirm(null)}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>¿Eliminar evento?</div>
            <p style={{ fontSize: 13, color: C.textSecondary, marginBottom: 16 }}>
              Esto eliminará <strong>{deleteEventConfirm.name}</strong> y todas sus {tasks.filter(t=>t.event===deleteEventConfirm.name).length} tareas. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <OutlineBtn onClick={() => setDeleteEventConfirm(null)}>Cancelar</OutlineBtn>
              <Btn color={C.danger} onClick={() => deleteEvent(deleteEventConfirm)}>Sí, eliminar</Btn>
            </div>
          </Modal>
        )}

      </div>
    </>
  );
}

// ─── Edit Task Modal ──────────────────────────────────────────────────────────
function EditTaskModal({ task, events, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({...task});
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>Editar tarea</div>
        <CloseBtn onClick={onClose} />
      </div>
      <FieldRow label="Tarea"><input style={inputStyle} value={form.task} onChange={e => setForm(p=>({...p,task:e.target.value}))} /></FieldRow>
      <FieldRow label="Evento">
        <select style={inputStyle} value={form.event} onChange={e => setForm(p=>({...p,event:e.target.value}))}>
          {events.map(ev => <option key={ev} value={ev}>{ev}</option>)}
        </select>
      </FieldRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <FieldRow label="Responsable">
          <select style={inputStyle} value={form.owner} onChange={e => setForm(p=>({...p,owner:e.target.value}))}>
            {OWNERS.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Estado">
          <select style={inputStyle} value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
            <option>Not started</option><option>In progress</option><option>Completed</option>
          </select>
        </FieldRow>
      </div>
      <FieldRow label="Fecha">
        <input style={inputStyle} type="date" value={toInputDate(form.date)} onChange={e => setForm(p=>({...p,date:fromInputDate(e.target.value)}))} />
      </FieldRow>
      <FieldRow label="Comentarios"><input style={inputStyle} value={form.comments} onChange={e => setForm(p=>({...p,comments:e.target.value}))} /></FieldRow>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: "1rem" }}>
        <Btn color={C.danger} onClick={() => onDelete(task.id)}>Eliminar</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
          <Btn onClick={() => onSave(task.id, form)}>Guardar</Btn>
        </div>
      </div>
    </>
  );
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({ form, onChange, events, onAdd, onClose }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>Nueva tarea</div>
        <CloseBtn onClick={onClose} />
      </div>
      <FieldRow label="Tarea"><input style={inputStyle} value={form.task} onChange={e => onChange(p=>({...p,task:e.target.value}))} placeholder="Nombre de la tarea" /></FieldRow>
      <FieldRow label="Evento">
        <select style={inputStyle} value={form.event} onChange={e => onChange(p=>({...p,event:e.target.value}))}>
          {events.map(ev=><option key={ev} value={ev}>{ev}</option>)}
        </select>
      </FieldRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <FieldRow label="Responsable">
          <select style={inputStyle} value={form.owner} onChange={e => onChange(p=>({...p,owner:e.target.value}))}>
            {OWNERS.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </FieldRow>
        <FieldRow label="Estado">
          <select style={inputStyle} value={form.status} onChange={e => onChange(p=>({...p,status:e.target.value}))}>
            <option>Not started</option><option>In progress</option><option>Completed</option>
          </select>
        </FieldRow>
      </div>
      <FieldRow label="Fecha">
        <input style={inputStyle} type="date" value={toInputDate(form.date)} onChange={e => onChange(p=>({...p,date:fromInputDate(e.target.value)}))} />
      </FieldRow>
      <FieldRow label="Comentarios"><input style={inputStyle} value={form.comments} onChange={e => onChange(p=>({...p,comments:e.target.value}))} placeholder="Opcional" /></FieldRow>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1rem" }}>
        <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
        <Btn onClick={() => onAdd(form)} disabled={!form.task}>Agregar</Btn>
      </div>
    </>
  );
}

// ─── Add/Edit Event Modal ─────────────────────────────────────────────────────
function EventModal({ mode, existing, template, onAdd, onEdit, onClose }) {
  const [name, setName]   = useState(existing?.name || "");
  const [dateStr, setDateStr] = useState(existing ? toInputDate(existing.date) : "");
  const [type, setType]   = useState(existing?.type || "Bodas");
  const [preview, setPreview] = useState(false);

  const dateSerial = dateStr ? fromInputDate(dateStr) : null;
  const previewTasks = (type === "Bodas" && name && dateSerial)
    ? template.map(tmpl => ({
        date: excelToDate(dateSerial - tmpl.daysBefore),
        task: `${tmpl.task} - ${name}`,
        owner: tmpl.owner,
      }))
    : [];

  const handleSubmit = () => {
    if (!name || !dateSerial) return;
    if (mode === "add") onAdd(name, dateSerial, type);
    else onEdit(existing, name, dateSerial, type);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{mode === "add" ? "Nuevo evento" : "Editar evento"}</div>
        <CloseBtn onClick={onClose} />
      </div>

      {mode === "edit" && (
        <div style={{ background: "#BA751711", border: `0.5px solid #BA751744`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#BA7517" }}>
          ⚠️ Editar el nombre o fecha actualizará automáticamente todas las tareas asociadas.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FieldRow label="Nombre del evento">
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: López Hernández" />
        </FieldRow>
        <FieldRow label="Tipo">
          <select style={inputStyle} value={type} onChange={e => setType(e.target.value)}>
            <option value="Bodas">Bodas</option>
            <option value="Corporativo">Corporativo</option>
          </select>
        </FieldRow>
      </div>
      <FieldRow label="Fecha del evento">
        <input style={inputStyle} type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} />
      </FieldRow>

      {type === "Bodas" && name && dateSerial && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setPreview(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.accent, padding: 0, textDecoration: "underline" }}>
            {preview ? "▲ Ocultar" : "▼ Ver"} las {template.length} tareas que se generarán
          </button>
          {preview && (
            <div style={{ marginTop: 8, maxHeight: 240, overflow: "auto", background: C.bgSecondary, borderRadius: 8, border: `0.5px solid ${C.borderTertiary}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>{["Fecha","Tarea","Responsable"].map(h=>(
                    <th key={h} style={{ textAlign: "left", padding: "6px 10px", borderBottom: `0.5px solid ${C.borderTertiary}`, color: C.textSecondary, fontWeight: 500 }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {previewTasks.map((t, i) => (
                    <tr key={i}>
                      <td style={{ padding: "5px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}>{formatDate(t.date)}</td>
                      <td style={{ padding: "5px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}>{t.task}</td>
                      <td style={{ padding: "5px 10px", borderBottom: `0.5px solid ${C.borderTertiary}` }}>
                        <Badge label={t.owner} color={OWNER_COLORS[t.owner]||"#888"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {type === "Corporativo" && (
        <div style={{ background: C.bgSecondary, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: C.textSecondary }}>
          Los eventos corporativos no generan tareas automáticamente. Podrás agregar tareas manualmente desde el calendario.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1rem" }}>
        <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
        <Btn onClick={handleSubmit} disabled={!name || !dateSerial}>
          {mode === "add" ? (type === "Bodas" ? `Crear y generar ${template.length} tareas` : "Crear evento") : "Guardar cambios"}
        </Btn>
      </div>
    </>
  );
}
