import test from 'node:test';
import assert from 'node:assert/strict';
import { getTaskReminder, groupTaskReminders } from './taskReminders.js';

test('due-date boundaries and completed tasks', () => {
  for (const [offset, expected] of [[-40, 'overdue'], [-1, 'overdue'], [0, 'today'], [1, 'upcoming'], [7, 'upcoming'], [8, null]]) {
    for (const status of ['Not Started', 'In Progress']) {
      assert.equal(getTaskReminder({ date: 46000 + offset, status }, 46000), expected);
    }
    assert.equal(getTaskReminder({ date: 46000 + offset, status: 'Completed' }, 46000), null);
  }
  for (const date of [undefined, null, NaN, Infinity, '46000']) {
    assert.equal(getTaskReminder({ date }, 46000), null);
  }
});

test('groups across months, sorts oldest first, preserves input', () => {
  const tasks = Object.freeze([
    Object.freeze({ id: 1, date: 45999 }), Object.freeze({ id: 2, date: 45900 }),
    Object.freeze({ id: 3, date: 46000 }), Object.freeze({ id: 4, date: 46007 }),
    Object.freeze({ id: 5, date: 45900, status: 'Completed' }),
  ]);
  const groups = groupTaskReminders(tasks, 46000);
  assert.deepEqual(groups.overdue.map(t => t.id), [2, 1]);
  assert.deepEqual(groups.today.map(t => t.id), [3]);
  assert.deepEqual(groups.upcoming.map(t => t.id), [4]);
  assert.deepEqual(tasks.map(t => t.id), [1, 2, 3, 4, 5]);
  assert.deepEqual(groupTaskReminders([], 46000), { overdue: [], today: [], upcoming: [] });
});

test('reminders update on completion and day rollover', () => {
  const task = { date: 46000, status: 'In Progress' };
  assert.equal(getTaskReminder(task, 45999), 'upcoming');
  assert.equal(getTaskReminder(task, 46000), 'today');
  assert.equal(getTaskReminder(task, 46001), 'overdue');
  assert.equal(getTaskReminder({ ...task, status: 'Completed' }, 46001), null);
});
