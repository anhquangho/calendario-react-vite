import { supabase } from '../lib/supabase'

const TASK_COLUMNS = [
  'id',
  'event_id',
  'template_id',
  'title',
  'owner',
  'due_date',
  'status',
  'comments',
  'is_generated',
  'created_by',
  'created_at',
  'updated_at',
  'event:events(id, name, event_date, event_type)',
].join(', ')

export async function getTasks(eventId) {
  let query = supabase
    .from('tasks')
    .select(TASK_COLUMNS)
    .order('due_date')
    .order('created_at')

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}

export async function createTask({
  eventId,
  title,
  owner,
  dueDate,
  status = 'Not started',
  comments = '',
}) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      event_id: eventId,
      title,
      owner,
      due_date: dueDate,
      status,
      comments,
      is_generated: false,
    })
    .select(TASK_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateTask(taskId, updates) {
  const payload = {}

  if (updates.eventId !== undefined) payload.event_id = updates.eventId
  if (updates.title !== undefined) payload.title = updates.title
  if (updates.owner !== undefined) payload.owner = updates.owner
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.comments !== undefined) payload.comments = updates.comments

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select(TASK_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteTask(taskId) {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .select('id')
    .single()

  if (error) {
    throw error
  }

  return data
}
