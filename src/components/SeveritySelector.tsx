type SeveritySelectorProps = {
  value: number
  onChange: (value: number) => void
}

const severityEmojis = [
  { value: 1, emoji: '😊' },
  { value: 2, emoji: '🙂' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '😕' },
  { value: 5, emoji: '😣' },
  { value: 6, emoji: '😖' },
  { value: 7, emoji: '😫' },
  { value: 8, emoji: '😩' },
  { value: 9, emoji: '😭' },
  { value: 10, emoji: '🤯' },
]

export function SeveritySelector({
  value,
  onChange,
}: SeveritySelectorProps) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: 600,
        }}
      >
        How bad does it hurt? {value}/10
      </label>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
        }}
      >
        {severityEmojis.map((item) => {
          const isSelected = value === item.value

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              aria-label={`Severity ${item.value} out of 10`}
              style={{
                fontSize: '28px',
                padding: '10px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #0070f3' : '1px solid #d0d7de',
                background: isSelected ? '#eef6ff' : '#fff',
                cursor: 'pointer',
              }}
            >
              <div>{item.emoji}</div>
              <div
                style={{
                  fontSize: '12px',
                  marginTop: '4px',
                  fontWeight: 600,
                }}
              >
                {item.value}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}