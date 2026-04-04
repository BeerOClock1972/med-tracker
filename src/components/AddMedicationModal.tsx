import { useState } from 'react'
import { createMedication } from '../lib/createMedication'

type AddMedicationModalProps = {
  isOpen: boolean
  onClose: () => void
  onAdded: () => Promise<void> | void
}

export function AddMedicationModal({
  isOpen,
  onClose,
  onAdded,
}: AddMedicationModalProps) {
  const [name, setName] = useState('')
  const [defaultDose, setDefaultDose] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) {
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setErrorMessage('Please enter a medication name.')
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage('')

      await createMedication({
        name: trimmedName,
        default_dose: defaultDose.trim() || null,
        notes: notes.trim() || null,
      })

      setName('')
      setDefaultDose('')
      setNotes('')

      await onAdded()
      onClose()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error)

      console.error('Add medication error:', error)
      setErrorMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  function handleClose() {
    if (isSaving) return
    setErrorMessage('')
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.22)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1E5A96, #1FA3A3)',
            color: '#ffffff',
            padding: '20px 20px 18px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              opacity: 0.9,
            }}
          >
            Med Tracker
          </p>

          <h2
            style={{
              margin: '6px 0 0',
              fontSize: '24px',
              lineHeight: 1.1,
            }}
          >
            Add medication
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: '14px',
            padding: '20px',
          }}
        >
          <div>
            <label
              htmlFor="medicationName"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#4B5563',
              }}
            >
              Medication name
            </label>
            <input
              id="medicationName"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Ibuprofen"
              disabled={isSaving}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                padding: '0 12px',
                fontSize: '14px',
                background: '#ffffff',
                color: '#1A1A1A',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="defaultDose"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#4B5563',
              }}
            >
              Default dose
            </label>
            <input
              id="defaultDose"
              type="text"
              value={defaultDose}
              onChange={(event) => setDefaultDose(event.target.value)}
              placeholder="e.g. 400mg"
              disabled={isSaving}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                padding: '0 12px',
                fontSize: '14px',
                background: '#ffffff',
                color: '#1A1A1A',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="medicationNotes"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#4B5563',
              }}
            >
              Notes
            </label>
            <textarea
              id="medicationNotes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes"
              disabled={isSaving}
              style={{
                width: '100%',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                padding: '10px 12px',
                fontSize: '14px',
                background: '#ffffff',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          {errorMessage ? (
            <div
              style={{
                borderRadius: '14px',
                padding: '12px 14px',
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: '13px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '4px',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              style={{
                minHeight: '44px',
                padding: '0 16px',
                borderRadius: '12px',
                background: '#E5E7EB',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                minHeight: '44px',
                padding: '0 18px',
                borderRadius: '12px',
                background: isSaving
                  ? '#93C5FD'
                  : 'linear-gradient(135deg, #1E5A96, #1FA3A3)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Saving...' : 'Add medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}