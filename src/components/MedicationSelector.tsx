import { useState } from 'react'
import type { Medication, CreateEntryMedicationInput } from '../types/database'
import { AddMedicationModal } from './AddMedicationModal'

type MedicationSelection = CreateEntryMedicationInput & {
  local_id: string
}

type MedicationSelectorProps = {
  medications: Medication[]
  selectedMedications: MedicationSelection[]
  onChange: (items: MedicationSelection[]) => void
  onMedicationAdded: () => Promise<void> | void
}

function createEmptyMedicationSelection(): MedicationSelection {
  return {
    local_id: crypto.randomUUID(),
    medication_id: '',
    dose: '',
    taken_at: '',
    helped: null,
    notes: '',
  }
}

export function MedicationSelector({
  medications,
  selectedMedications,
  onChange,
  onMedicationAdded,
}: MedicationSelectorProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  function handleAddMedicationRow() {
    onChange([...selectedMedications, createEmptyMedicationSelection()])
  }

  function handleRemoveMedication(localId: string) {
    onChange(selectedMedications.filter((item) => item.local_id !== localId))
  }

  function handleUpdateMedication(
    localId: string,
    updates: Partial<MedicationSelection>
  ) {
    onChange(
      selectedMedications.map((item) =>
        item.local_id === localId ? { ...item, ...updates } : item
      )
    )
  }

  async function handleMedicationAdded() {
    await onMedicationAdded()
  }

  return (
    <>
      <section
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '18px',
          boxShadow: '0 10px 30px rgba(17, 24, 39, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: '#6B7280',
              }}
            >
              Medication
            </p>

            <h2
              style={{
                margin: '6px 0 0',
                fontSize: '22px',
                color: '#1E5A96',
              }}
            >
              Did you take anything?
            </h2>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: selectedMedications.length > 0 ? '14px' : '0',
          }}
        >
          <button
            type="button"
            onClick={handleAddMedicationRow}
            style={{
              border: 'none',
              background: '#1FA3A3',
              color: '#ffffff',
              borderRadius: '14px',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add to entry
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              border: '1px solid #1E5A96',
              background: '#ffffff',
              color: '#1E5A96',
              borderRadius: '14px',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + New medication
          </button>
        </div>

        {selectedMedications.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            No medication added for this entry.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
          >
            {selectedMedications.map((item) => (
              <div
                key={item.local_id}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '14px',
                  background: '#F9FAFB',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  <select
                    value={item.medication_id}
                    onChange={(event) =>
                      handleUpdateMedication(item.local_id, {
                        medication_id: event.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      padding: '0 12px',
                      fontSize: '14px',
                      background: '#ffffff',
                      color: '#1A1A1A',
                    }}
                  >
                    <option value="">Select medication</option>
                    {medications.map((medication) => (
                      <option key={medication.id} value={medication.id}>
                        {medication.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Dose (e.g. 400mg)"
                    value={item.dose ?? ''}
                    onChange={(event) =>
                      handleUpdateMedication(item.local_id, {
                        dose: event.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      padding: '0 12px',
                      fontSize: '14px',
                      background: '#ffffff',
                      color: '#1A1A1A',
                      boxSizing: 'border-box',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateMedication(item.local_id, { helped: true })
                      }
                      style={{
                        border:
                          item.helped === true
                            ? '1px solid #1FA3A3'
                            : '1px solid #E5E7EB',
                        background:
                          item.helped === true ? '#1FA3A3' : '#ffffff',
                        color: item.helped === true ? '#ffffff' : '#374151',
                        borderRadius: '999px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Helped
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateMedication(item.local_id, {
                          helped: false,
                        })
                      }
                      style={{
                        border:
                          item.helped === false
                            ? '1px solid #E53935'
                            : '1px solid #E5E7EB',
                        background:
                          item.helped === false ? '#E53935' : '#ffffff',
                        color: item.helped === false ? '#ffffff' : '#374151',
                        borderRadius: '999px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Didn’t help
                    </button>
                  </div>

                  <textarea
                    placeholder="Notes (optional)"
                    value={item.notes ?? ''}
                    onChange={(event) =>
                      handleUpdateMedication(item.local_id, {
                        notes: event.target.value,
                      })
                    }
                    rows={3}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      padding: '10px 12px',
                      fontSize: '14px',
                      background: '#ffffff',
                      color: '#1A1A1A',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(item.local_id)}
                    style={{
                      alignSelf: 'flex-start',
                      border: 'none',
                      background: 'transparent',
                      color: '#E53935',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Remove medication
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={handleMedicationAdded}
      />
    </>
  )
}