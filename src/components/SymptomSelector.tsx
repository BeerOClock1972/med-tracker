type Symptom = {
  id: string
  name?: string
  symptom_name?: string
  label?: string
  title?: string
}

type SymptomSelectorProps = {
  symptoms: Symptom[]
  selectedSymptomIds: string[]
  onToggle: (id: string) => void
}

export function SymptomSelector({
  symptoms,
  selectedSymptomIds,
  onToggle,
}: SymptomSelectorProps) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '10px',
          fontWeight: 700,
          fontSize: '18px',
          color: '#111827',
        }}
      >
        Symptoms
      </label>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px',
        }}
      >
        {symptoms.map((symptom) => {
          const isSelected = selectedSymptomIds.includes(symptom.id)
          const label =
            symptom.name ||
            symptom.symptom_name ||
            symptom.label ||
            symptom.title ||
            'Unnamed symptom'

          return (
            <button
              key={symptom.id}
              type="button"
              onClick={() => onToggle(symptom.id)}
              style={{
                minHeight: '48px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                background: isSelected ? '#DBEAFE' : '#FFFFFF',
                color: '#111827',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}