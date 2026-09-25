import { supabase } from '../lib/supabase'

const TASK_TEMPLATE_COLUMNS = [
  'id',
  'event_type',
  'sort_order',
  'days_before',
  'title',
  'default_owner',
  'is_active',
].join(', ')

export async function getTaskTemplates(eventType) {
  let query = supabase
    .from('task_templates')
    .select(TASK_TEMPLATE_COLUMNS)
    .eq('is_active', true)
    .order('event_type')
    .order('sort_order')

  if (eventType) {
    query = query.eq('event_type', eventType)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data
}
