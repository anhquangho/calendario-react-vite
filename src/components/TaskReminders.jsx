import { useState } from "react";
import { getTaskReminder, groupTaskReminders, UPCOMING_DAYS } from "../lib/taskReminders";
import "./TaskReminders.css";

const LABELS = { overdue: "Vencida", today: "Hoy", upcoming: "Próxima" };
const GROUP_LABELS = { overdue: "Vencidas", today: "Hoy", upcoming: `Próximos ${UPCOMING_DAYS} días` };

export function TaskReminderBadge({ task, todaySerial }) {
  const kind = getTaskReminder(task, todaySerial);
  return kind ? <span className={`task-reminder-badge task-reminder-${kind}`}>{LABELS[kind]}</span> : null;
}

export default function TaskReminders({ tasks, todaySerial, onOpenTask, formatTaskDate }) {
  const [selected, setSelected] = useState("overdue");
  const [expanded, setExpanded] = useState(false);
  const groups = groupTaskReminders(tasks, todaySerial);
  const visibleTasks = expanded ? groups[selected] : groups[selected].slice(0, 8);

  return (
    <section className="task-reminders" aria-labelledby="task-reminders-title">
      <h2 id="task-reminders-title">Recordatorios</h2>
      <p className="task-reminders-help">Tareas pendientes de todos los meses, según los filtros seleccionados. Fechas según este dispositivo.</p>
      <div className="task-reminders-tabs" aria-label="Tipo de recordatorio">
        {Object.keys(groups).map(kind => (
          <button type="button" key={kind} aria-pressed={selected === kind}
            onClick={() => { setSelected(kind); setExpanded(false); }}>
            {GROUP_LABELS[kind]} <strong>{groups[kind].length}</strong>
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {visibleTasks.length === 0 ? (
          <p className="task-reminders-empty">No hay tareas pendientes en esta categoría con los filtros actuales.</p>
        ) : (
          <ul className="task-reminders-list">
            {visibleTasks.map(task => (
              <li key={task.id}>
                <button type="button" className="task-reminders-item" onClick={() => onOpenTask(task)}>
                  <span className="task-reminders-content">
                    <span className="task-reminders-title">{task.title || task.task}</span>
                    <span className="task-reminders-meta">{task.event} · {task.owner} · {formatTaskDate(task.date)}</span>
                  </span>
                  <TaskReminderBadge task={task} todaySerial={todaySerial} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {groups[selected].length > 8 && (
        <button type="button" className="task-reminders-expand" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Mostrar menos" : `Ver todas (${groups[selected].length})`}
        </button>
      )}
    </section>
  );
}
