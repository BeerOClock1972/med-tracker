import { supabase } from './supabase'
import type { Medication } from '../types/database'

type CreateMedicationInput = {
  name: string
  default_dose?: string | null
  notes?: string | null
}

export async function createMedication(
  input: CreateMedicationInput
): Promise<Medication> {
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

  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : null

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name: fullName,
    },
    {
      onConflict: 'id',
    }
  )

  if (profileError) {
    throw new Error(profileError.message)
  }

  const { data, error } = await supabase
    .from('medications')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      default_dose: input.default_dose ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Medication
}