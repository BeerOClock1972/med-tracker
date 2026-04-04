export type SeverityLabel = 'mild' | 'moderate' | 'severe' | 'very_severe'

export type PainSide = 'left' | 'right' | 'both' | 'center' | 'unknown'

export type PainRegion =
  | 'front'
  | 'temple'
  | 'top'
  | 'back'
  | 'behind_eye'
  | 'neck'
  | 'full_head'
  | 'unknown'

export interface Profile {
  id: string
  full_name: string | null
  date_of_birth: string | null
  created_at: string
  updated_at: string
}

export interface HeadacheEntry {
  id: string
  user_id: string
  occurred_at: string
  severity_score: number
  severity_label: SeverityLabel
  pain_side: PainSide | null
  pain_region: PainRegion | null
  duration_minutes: number | null
  trigger_notes: string | null
  general_notes: string | null
  hospital_relevant: boolean
  created_at: string
  updated_at: string
}

export interface Symptom {
  id: string
  slug: string
  label: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface EntrySymptom {
  id: string
  entry_id: string
  symptom_id: string
  created_at: string
}

export interface Medication {
  id: string
  user_id: string
  name: string
  default_dose: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface EntryMedication {
  id: string
  entry_id: string
  medication_id: string
  dose: string | null
  taken_at: string | null
  helped: boolean | null
  notes: string | null
  created_at: string
}

export interface CreateEntryMedicationInput {
  medication_id: string
  dose?: string | null
  taken_at?: string | null
  helped?: boolean | null
  notes?: string | null
}

export interface CreateHeadacheEntryInput {
  occurred_at?: string
  severity_score: number
  pain_side?: PainSide | null
  pain_region?: PainRegion | null
  duration_minutes?: number | null
  trigger_notes?: string | null
  general_notes?: string | null
  hospital_relevant?: boolean
  symptom_ids?: string[]
  medications?: CreateEntryMedicationInput[]
}