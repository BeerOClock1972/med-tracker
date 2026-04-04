import { supabase } from './supabase'
import type {
  CreateHeadacheEntryInput,
  HeadacheEntry,
} from '../types/database'

export async function createHeadacheEntry(
  input: CreateHeadacheEntryInput
): Promise<HeadacheEntry> {
  const {
    symptom_ids = [],
    medications = [],
    occurred_at,
    severity_score,
    pain_side = null,
    pain_region = null,
    duration_minutes = null,
    trigger_notes = null,
    general_notes = null,
    hospital_relevant = false,
  } = input

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(userError.message)
  }

  if (!user) {
    throw new Error('User is not authenticated')
  }

  const { data: entry, error: entryError } = await supabase
    .from('headache_entries')
    .insert({
      user_id: user.id,
      occurred_at: occurred_at ?? new Date().toISOString(),
      severity_score,
      pain_side,
      pain_region,
      duration_minutes,
      trigger_notes,
      general_notes,
      hospital_relevant,
    })
    .select()
    .single()

  if (entryError) {
    throw new Error(entryError.message)
  }

  if (!entry) {
    throw new Error('Failed to create headache entry')
  }

  if (symptom_ids.length > 0) {
    const symptomRows = symptom_ids.map((symptom_id) => ({
      entry_id: entry.id,
      symptom_id,
    }))

    const { error: symptomsError } = await supabase
      .from('entry_symptoms')
      .insert(symptomRows)

    if (symptomsError) {
      throw new Error(symptomsError.message)
    }
  }

  if (medications.length > 0) {
    const medicationRows = medications.map((medication) => ({
      entry_id: entry.id,
      medication_id: medication.medication_id,
      dose: medication.dose ?? null,
      taken_at: medication.taken_at ?? null,
      helped: medication.helped ?? null,
      notes: medication.notes ?? null,
    }))

    const { error: medicationsError } = await supabase
      .from('entry_medications')
      .insert(medicationRows)

    if (medicationsError) {
      throw new Error(medicationsError.message)
    }
  }

  return entry as HeadacheEntry
}

export async function getHeadacheEntryById(entryId: string) {
  const { data, error } = await supabase
    .from('headache_entries')
    .select(
      `
      *,
      entry_symptoms (
        id,
        symptom:symptoms (
          id,
          slug,
          label
        )
      ),
      entry_medications (
        id,
        dose,
        taken_at,
        helped,
        notes,
        medication:medications (
          id,
          name,
          default_dose
        )
      )
    `
    )
    .eq('id', entryId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}