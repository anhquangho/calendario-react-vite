export const UPCOMING_DAYS = 7;

// Dates use the same calendar-day serials as App; no elapsed-hour comparison.
export function getTaskReminder(task, todaySerial) {
  if (task.status === "Completed" || !Number.isFinite(task.date)) return null;
  const days = task.date - todaySerial;
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= UPCOMING_DAYS) return "upcoming";
  return null;
}

export function groupTaskReminders(tasks, todaySerial) {
  const groups = { overdue: [], today: [], upcoming: [] };
  for (const task of tasks) {
    const kind = getTaskReminder(task, todaySerial);
    if (kind) groups[kind].push(task);
  }
  for (const group of Object.values(groups)) group.sort((a, b) => a.date - b.date);
  return groups;
}
