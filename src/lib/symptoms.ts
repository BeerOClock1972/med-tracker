import { supabase } from './supabase'
import type { Symptom } from '../types/database'

export async function getSymptoms(): Promise<Symptom[]> {
  const { data, error } = await supabase
    .from('symptoms')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Symptom[]
}