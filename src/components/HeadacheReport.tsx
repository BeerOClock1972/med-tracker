import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type SymptomItem = {
  symptom_id?: string
  symptoms?: {
    id?: string
    label?: string
  } | null
}

type MedicationItem = {
  id: string
  dose: string | null
  taken_at: string | null
  helped: boolean | null
  notes: string | null
  medications?: {
    id?: string
    name?: string
    default_dose?: string | null
  } | null
}

type HeadacheEntryRow = {
  id: string
  occurred_at: string
  severity_score: number
  severity_label: string
  pain_side: string | null
  pain_region: string | null
  duration_minutes: number | null
  trigger_notes: string | null
  entry_symptoms?: SymptomItem[] | null
  entry_medications?: MedicationItem[] | null
}

export function HeadacheReport() {
  const [entries, setEntries] = useState<HeadacheEntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth < 768
  })

  useEffect(() => {
    void fetchReport()
  }, [])

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  async function fetchReport() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('headache_entries')
      .select(`
        id,
        occurred_at,
        severity_score,
        severity_label,
        pain_side,
        pain_region,
        duration_minutes,
        trigger_notes,
        entry_symptoms (
          symptom_id,
          symptoms (
            id,
            label
          )
        ),
        entry_medications (
          id,
          dose,
          taken_at,
          helped,
          notes,
          medications (
            id,
            name,
            default_dose
          )
        )
      `)
      .order('occurred_at', { ascending: false })

    if (error) {
      console.error('Error fetching headache report:', error)
      setError(error.message)
      setEntries([])
      setLoading(false)
      return
    }

    setEntries((data ?? []) as unknown as HeadacheEntryRow[])
    setLoading(false)
  }

  const hasEntries = useMemo(() => entries.length > 0, [entries])

  function formatDateTime(value: string | null) {
    if (!value) return '-'

    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDuration(minutes: number | null) {
    if (minutes == null) return '-'
    if (minutes < 60) return `${minutes} min`

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) return `${hours}h`
    return `${hours}h ${remainingMinutes}m`
  }

  function formatPainLocation(entry: HeadacheEntryRow) {
    const side = entry.pain_side?.trim()
    const region = entry.pain_region?.trim()

    const cleanSide = !side || side.toLowerCase() === 'unknown' ? '' : side
    const cleanRegion = !region || region.toLowerCase() === 'unknown' ? '' : region

    if (cleanSide && cleanRegion) return `${cleanSide} - ${cleanRegion}`
    if (cleanSide) return cleanSide
    if (cleanRegion) return cleanRegion
    return '-'
  }

  function getSymptoms(entry: HeadacheEntryRow) {
    const labels =
      entry.entry_symptoms
        ?.map((item) => item.symptoms?.label?.trim())
        .filter((label): label is string => Boolean(label)) ?? []

    return labels.length > 0 ? labels.join(', ') : '-'
  }

  function getMedications(entry: HeadacheEntryRow) {
    const meds =
      entry.entry_medications
        ?.map((item) => {
          const name = item.medications?.name?.trim()
          if (!name) return null

          const parts: string[] = [name]

          if (item.dose?.trim()) {
            parts.push(item.dose.trim())
          } else if (item.medications?.default_dose?.trim()) {
            parts.push(item.medications.default_dose.trim())
          }

          if (item.taken_at) {
            parts.push(`at ${formatDateTime(item.taken_at)}`)
          }

          if (item.helped === true) {
            parts.push('(helped)')
          } else if (item.helped === false) {
            parts.push('(did not help)')
          }

          if (item.notes?.trim()) {
            parts.push(`- ${item.notes.trim()}`)
          }

          return parts.join(' ')
        })
        .filter((value): value is string => Boolean(value)) ?? []

    return meds.length > 0 ? meds.join('; ') : '-'
  }

  const cardStyle: React.CSSProperties = {
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    background: '#FFFFFF',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
  }

  if (loading) {
    return (
      <div style={{ ...cardStyle, padding: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#0F172A' }}>
          Headache Report
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#475569' }}>
          Loading report...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          ...cardStyle,
          padding: '16px',
          border: '1px solid #FCA5A5',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '18px', color: '#0F172A' }}>
          Headache Report
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#DC2626' }}>
          Could not load report: {error}
        </p>
      </div>
    )
  }

  return (
    <div style={{ ...cardStyle, padding: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#0F172A' }}>
            Headache Report
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#475569' }}>
            A full list of headache entries including symptoms and medication.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchReport()}
          style={{
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            color: '#334155',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Refresh
        </button>
      </div>

      {!hasEntries ? (
        <div
          style={{
            border: '1px dashed #CBD5E1',
            borderRadius: '14px',
            background: '#F8FAFC',
            padding: '24px',
            fontSize: '14px',
            color: '#475569',
          }}
        >
          No headache entries found yet.
        </div>
      ) : isMobile ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                background: '#F8FAFC',
                padding: '14px',
              }}
            >
              <div
                style={{
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                {formatDateTime(entry.occurred_at)}
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#334155',
                }}
              >
                <div>
                  <strong style={{ color: '#0F172A' }}>Severity:</strong>{' '}
                  {entry.severity_score} ({entry.severity_label})
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Where it hurts:</strong>{' '}
                  {formatPainLocation(entry)}
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Duration:</strong>{' '}
                  {formatDuration(entry.duration_minutes)}
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Triggers:</strong>{' '}
                  {entry.trigger_notes?.trim() || '-'}
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Symptoms:</strong>{' '}
                  {getSymptoms(entry)}
                </div>
                <div>
                  <strong style={{ color: '#0F172A' }}>Medication:</strong>{' '}
                  {getMedications(entry)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '900px',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr>
                {[
                  'Date & time',
                  'Severity',
                  'Where it hurts',
                  'Duration',
                  'Triggers',
                  'Symptoms',
                  'Medication',
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      background: '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0',
                      color: '#334155',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ verticalAlign: 'top' }}>
                  <td style={cellStyle}>{formatDateTime(entry.occurred_at)}</td>
                  <td style={cellStyle}>
                    {entry.severity_score} ({entry.severity_label})
                  </td>
                  <td style={cellStyle}>{formatPainLocation(entry)}</td>
                  <td style={cellStyle}>{formatDuration(entry.duration_minutes)}</td>
                  <td style={cellStyle}>{entry.trigger_notes?.trim() || '-'}</td>
                  <td style={cellStyle}>{getSymptoms(entry)}</td>
                  <td style={cellStyle}>{getMedications(entry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const cellStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderBottom: '1px solid #E2E8F0',
  color: '#334155',
}