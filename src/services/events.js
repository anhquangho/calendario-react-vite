import { supabase } from '../lib/supabase'

const EVENT_COLUMNS = [
  'id',
  'name',
  'event_date',
  'event_type',
  'created_by',
  'created_at',
  'updated_at',
].join(', ')

export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .order('event_date')
    .order('name')

  if (error) {
    throw error
  }

  return data
}

export async function createEventWithTasks({ name, eventDate, eventType }) {
  const { data, error } = await supabase.rpc('create_event_with_tasks', {
    p_name: name,
    p_event_date: eventDate,
    p_event_type: eventType,
  })

  if (error) {
    throw error
  }

  return data
}

export async function deleteEvent(eventId) {
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .select('id')
    .single()

  if (error) {
    throw error
  }

  return data
}
