import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SeveritySelector } from './SeveritySelector'

type PainSide = 'left' | 'right' | 'both' | 'center' | 'unknown'
type PainRegion =
  | 'front'
  | 'temple'
  | 'top'
  | 'back'
  | 'behind_eye'
  | 'neck'
  | 'full_head'
  | 'unknown'

type Medication = {
  id: string
  name: string
  default_dose: string | null
  notes: string | null
}

type MedicationLogRow = {
  medication_id: string
  dose: string
  taken_at: string
  helped: '' | 'yes' | 'no'
  notes: string
}

type Symptom = {
  id: string
  label: string
}

type HoveredHotspot = {
  label: string
  x: number
  y: number
} | null

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function createEmptyMedicationRow(): MedicationLogRow {
  return {
    medication_id: '',
    dose: '',
    taken_at: toDateTimeLocalValue(new Date()),
    helped: '',
    notes: '',
  }
}

function getFriendlyRegionLabel(region: PainRegion) {
  switch (region) {
    case 'front':
      return 'Front'
    case 'temple':
      return 'Temple'
    case 'top':
      return 'Top'
    case 'back':
      return 'Back'
    case 'behind_eye':
      return 'Behind eye'
    case 'neck':
      return 'Neck'
    case 'full_head':
      return 'Whole head'
    default:
      return 'Unknown'
  }
}

function getFriendlySideLabel(side: PainSide) {
  switch (side) {
    case 'left':
      return 'Left'
    case 'right':
      return 'Right'
    case 'both':
      return 'Both sides'
    case 'center':
      return 'Middle'
    default:
      return 'Unknown'
  }
}

function cardStyle() {
  return {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '18px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
  } as const
}

type HeadPainSelectorProps = {
  painSide: PainSide
  painRegion: PainRegion
  onChangeSide: (value: PainSide) => void
  onChangeRegion: (value: PainRegion) => void
}

function HeadPainSelector({
  painSide,
  painRegion,
  onChangeSide,
  onChangeRegion,
}: HeadPainSelectorProps) {
  const [viewAngle, setViewAngle] = useState(0)
  const [hoveredHotspot, setHoveredHotspot] = useState<HoveredHotspot>(null)

  const isFrontView = viewAngle >= -35 && viewAngle <= 35
  const isLeftView = viewAngle < -35
  const isRightView = viewAngle > 35

  const selectedFill = 'rgba(20, 184, 166, 0.30)'
  const selectedStroke = '#0F766E'
  const hotspotFill = 'rgba(59, 130, 246, 0.10)'
  const hotspotStroke = '#94A3B8'
  const eyeFill = 'rgba(244, 114, 182, 0.18)'
  const eyeStroke = '#F9A8D4'
  const wholeHeadFill = 'rgba(250, 204, 21, 0.15)'
  const wholeHeadStroke = '#CA8A04'

  function selectRegion(region: PainRegion, side: PainSide) {
    onChangeRegion(region)
    onChangeSide(side)
  }

  function isSelected(region: PainRegion, side?: PainSide) {
    if (painRegion !== region) return false
    if (!side) return true
    return painSide === side
  }

  function showHover(label: string, x: number, y: number) {
    setHoveredHotspot({ label, x, y })
  }

  function hideHover() {
    setHoveredHotspot(null)
  }

  const helperText = useMemo(() => {
    if (painRegion === 'unknown' && painSide === 'unknown') {
      return 'Tap the head to show where it hurts.'
    }

    return `${getFriendlyRegionLabel(painRegion)} • ${getFriendlySideLabel(
      painSide
    )}`
  }, [painRegion, painSide])

  const hotspotCursor = { cursor: 'pointer' as const }

  return (
    <div style={cardStyle()}>
      <div
        style={{
          fontWeight: 700,
          fontSize: '16px',
          color: '#111827',
          marginBottom: '8px',
        }}
      >
        Where does it hurt?
      </div>

      <div
        style={{
          fontSize: '14px',
          color: '#64748B',
          marginBottom: '14px',
        }}
      >
        Turn the head, then tap the sore area.
      </div>

      <div
        style={{
          display: 'grid',
          gap: '16px',
          justifyItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '340px',
            background:
              'radial-gradient(circle at top, #FFFFFF 0%, #EFF6FF 55%, #E2E8F0 100%)',
            borderRadius: '24px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <svg
            viewBox="0 0 260 280"
            width="100%"
            aria-label="Head pain selector"
            style={{ display: 'block' }}
          >
            <ellipse
              cx="130"
              cy="250"
              rx="54"
              ry="10"
              fill="rgba(15, 23, 42, 0.08)"
            />

            {isFrontView ? (
              <>
                <ellipse
                  cx="130"
                  cy="70"
                  rx="64"
                  ry="42"
                  fill="#8B5CF6"
                  opacity="0.95"
                />
                <ellipse
                  cx="130"
                  cy="126"
                  rx="72"
                  ry="84"
                  fill="#F4C7A1"
                  stroke="#D4A373"
                  strokeWidth="2"
                />
                <ellipse
                  cx="130"
                  cy="132"
                  rx="62"
                  ry="72"
                  fill="rgba(255,255,255,0.08)"
                />
                <rect
                  x="102"
                  y="198"
                  width="56"
                  height="36"
                  rx="18"
                  fill="#F4C7A1"
                  stroke="#D4A373"
                  strokeWidth="2"
                />
                <path
                  d="M84 126 Q74 132 80 146"
                  fill="none"
                  stroke="#D4A373"
                  strokeWidth="2"
                />
                <path
                  d="M176 126 Q186 132 180 146"
                  fill="none"
                  stroke="#D4A373"
                  strokeWidth="2"
                />

                <circle cx="106" cy="120" r="7" fill="#111827" />
                <circle cx="154" cy="120" r="7" fill="#111827" />
                <path
                  d="M130 128 L124 146 Q130 150 136 146"
                  fill="none"
                  stroke="#B45309"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M110 166 Q130 180 150 166"
                  fill="none"
                  stroke="#9A3412"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <ellipse
                  cx="130"
                  cy="126"
                  rx="70"
                  ry="82"
                  fill={
                    isSelected('full_head', 'both') ? wholeHeadFill : 'transparent'
                  }
                  stroke={
                    isSelected('full_head', 'both')
                      ? wholeHeadStroke
                      : 'transparent'
                  }
                  strokeWidth="3"
                  style={hotspotCursor}
                  onClick={() => selectRegion('full_head', 'both')}
                  onMouseEnter={() => showHover('Whole head', 130, 44)}
                  onMouseLeave={hideHover}
                >
                  <title>Whole head</title>
                </ellipse>

                <ellipse
                  cx="92"
                  cy="134"
                  rx="24"
                  ry="34"
                  fill={isSelected('temple', 'left') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('temple', 'left') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('temple', 'left')}
                  onMouseEnter={() => showHover('Left temple', 74, 94)}
                  onMouseLeave={hideHover}
                >
                  <title>Left temple</title>
                </ellipse>

                <ellipse
                  cx="168"
                  cy="134"
                  rx="24"
                  ry="34"
                  fill={isSelected('temple', 'right') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('temple', 'right') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('temple', 'right')}
                  onMouseEnter={() => showHover('Right temple', 154, 94)}
                  onMouseLeave={hideHover}
                >
                  <title>Right temple</title>
                </ellipse>

                <ellipse
                  cx="130"
                  cy="110"
                  rx="38"
                  ry="22"
                  fill={isSelected('front', 'center') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('front', 'center') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('front', 'center')}
                  onMouseEnter={() => showHover('Front', 130, 84)}
                  onMouseLeave={hideHover}
                >
                  <title>Front</title>
                </ellipse>

                <ellipse
                  cx="130"
                  cy="76"
                  rx="34"
                  ry="18"
                  fill={isSelected('top', 'center') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('top', 'center') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('top', 'center')}
                  onMouseEnter={() => showHover('Top', 130, 52)}
                  onMouseLeave={hideHover}
                >
                  <title>Top</title>
                </ellipse>

                <ellipse
                  cx="112"
                  cy="122"
                  rx="16"
                  ry="12"
                  fill={
                    isSelected('behind_eye', 'left') ? selectedFill : eyeFill
                  }
                  stroke={
                    isSelected('behind_eye', 'left') ? selectedStroke : eyeStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('behind_eye', 'left')}
                  onMouseEnter={() => showHover('Behind left eye', 96, 98)}
                  onMouseLeave={hideHover}
                >
                  <title>Behind left eye</title>
                </ellipse>

                <ellipse
                  cx="148"
                  cy="122"
                  rx="16"
                  ry="12"
                  fill={
                    isSelected('behind_eye', 'right') ? selectedFill : eyeFill
                  }
                  stroke={
                    isSelected('behind_eye', 'right') ? selectedStroke : eyeStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('behind_eye', 'right')}
                  onMouseEnter={() => showHover('Behind right eye', 166, 98)}
                  onMouseLeave={hideHover}
                >
                  <title>Behind right eye</title>
                </ellipse>

                <ellipse
                  cx="130"
                  cy="214"
                  rx="24"
                  ry="14"
                  fill={isSelected('neck', 'center') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('neck', 'center') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('neck', 'center')}
                  onMouseEnter={() => showHover('Neck', 130, 194)}
                  onMouseLeave={hideHover}
                >
                  <title>Neck</title>
                </ellipse>
              </>
            ) : isLeftView ? (
              <>
                <ellipse
                  cx="122"
                  cy="70"
                  rx="60"
                  ry="40"
                  fill="#8B5CF6"
                  opacity="0.95"
                />
                <path
                  d="M165 126
                    C165 82, 138 52, 104 52
                    C72 52, 56 86, 56 126
                    C56 166, 78 205, 112 210
                    C144 214, 165 182, 165 126Z"
                  fill="#F4C7A1"
                  stroke="#D4A373"
                  strokeWidth="2"
                />
                <path
                  d="M160 118
                    C160 88, 138 64, 108 60
                    C82 58, 60 86, 60 126"
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="10"
                />
                <ellipse cx="96" cy="120" rx="7" ry="7" fill="#111827" />
                <path
                  d="M88 166 Q104 176 120 166"
                  fill="none"
                  stroke="#9A3412"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M154 122 Q176 134 160 152"
                  fill="none"
                  stroke="#D4A373"
                  strokeWidth="2"
                />
                <rect
                  x="100"
                  y="198"
                  width="44"
                  height="34"
                  rx="16"
                  fill="#F4C7A1"
                  stroke="#D4A373"
                  strokeWidth="2"
                />

                <ellipse
                  cx="108"
                  cy="126"
                  rx="52"
                  ry="78"
                  fill={
                    isSelected('full_head', 'left') ? wholeHeadFill : 'transparent'
                  }
                  stroke={
                    isSelected('full_head', 'left')
                      ? wholeHeadStroke
                      : 'transparent'
                  }
                  strokeWidth="3"
                  style={hotspotCursor}
                  onClick={() => selectRegion('full_head', 'left')}
                  onMouseEnter={() => showHover('Whole left side', 104, 44)}
                  onMouseLeave={hideHover}
                >
                  <title>Whole left side</title>
                </ellipse>

                <ellipse
                  cx="82"
                  cy="130"
                  rx="26"
                  ry="34"
                  fill={isSelected('temple', 'left') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('temple', 'left') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('temple', 'left')}
                  onMouseEnter={() => showHover('Left temple', 74, 94)}
                  onMouseLeave={hideHover}
                >
                  <title>Left temple</title>
                </ellipse>

                <ellipse
                  cx="106"
                  cy="114"
                  rx="18"
                  ry="12"
                  fill={
                    isSelected('behind_eye', 'left') ? selectedFill : eyeFill
                  }
                  stroke={
                    isSelected('behind_eye', 'left') ? selectedStroke : eyeStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('behind_eye', 'left')}
                  onMouseEnter={() => showHover('Behind left eye', 112, 92)}
                  onMouseLeave={hideHover}
                >
                  <title>Behind left eye</title>
                </ellipse>

                <ellipse
                  cx="118"
                  cy="76"
                  rx="30"
                  ry="18"
                  fill={isSelected('top', 'left') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('top', 'left') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('top', 'left')}
                  onMouseEnter={() => showHover('Top left', 122, 54)}
                  onMouseLeave={hideHover}
                >
                  <title>Top left</title>
                </ellipse>

                <ellipse
                  cx="132"
                  cy="214"
                  rx="22"
                  ry="14"
                  fill={isSelected('neck', 'left') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('neck', 'left') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('neck', 'left')}
                  onMouseEnter={() => showHover('Left neck', 138, 192)}
                  onMouseLeave={hideHover}
                >
                  <title>Left neck</title>
                </ellipse>
              </>
            ) : (
              <>
                <ellipse
                  cx="138"
                  cy="70"
                  rx="60"
                  ry="40"
                  fill="#8B5CF6"
                  opacity="0.95"
                />
                <path
                  d="M95 126
                    C95 82, 122 52, 156 52
                    C188 52, 204 86, 204 126
                    C204 166, 182 205, 148 210
                    C116 214, 95 182, 95 126Z"
                  fill="#F4C7A1"
                  stroke="#D4A373"
                  strokeWidth="2"
                />
                <path
                  d="M100 118
                    C100 88, 122 64, 152 60
                    C178 58, 200 86, 200 126"
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="10"
                />
                <ellipse cx="164" cy="120" rx="7" ry="7" fill="#111827" />
                <path
                  d="M140 166 Q156 176 172 166"
                  fill="none"
                  stroke="#9A3412"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M106 122 Q84 134 100 152"
                  fill="none"
                  stroke="#D4A373"
                  strokeWidth="2"
                />
                <rect
                  x="116"
                  y="198"
                  width="44"
                  height="34"
                  rx="16"
                  fill="#F4C7A1"
                  stroke="#D4A373"
                  strokeWidth="2"
                />

                <ellipse
                  cx="152"
                  cy="126"
                  rx="52"
                  ry="78"
                  fill={
                    isSelected('full_head', 'right')
                      ? wholeHeadFill
                      : 'transparent'
                  }
                  stroke={
                    isSelected('full_head', 'right')
                      ? wholeHeadStroke
                      : 'transparent'
                  }
                  strokeWidth="3"
                  style={hotspotCursor}
                  onClick={() => selectRegion('full_head', 'right')}
                  onMouseEnter={() => showHover('Whole right side', 156, 44)}
                  onMouseLeave={hideHover}
                >
                  <title>Whole right side</title>
                </ellipse>

                <ellipse
                  cx="178"
                  cy="130"
                  rx="26"
                  ry="34"
                  fill={isSelected('temple', 'right') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('temple', 'right') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('temple', 'right')}
                  onMouseEnter={() => showHover('Right temple', 184, 94)}
                  onMouseLeave={hideHover}
                >
                  <title>Right temple</title>
                </ellipse>

                <ellipse
                  cx="154"
                  cy="114"
                  rx="18"
                  ry="12"
                  fill={
                    isSelected('behind_eye', 'right') ? selectedFill : eyeFill
                  }
                  stroke={
                    isSelected('behind_eye', 'right') ? selectedStroke : eyeStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('behind_eye', 'right')}
                  onMouseEnter={() => showHover('Behind right eye', 150, 92)}
                  onMouseLeave={hideHover}
                >
                  <title>Behind right eye</title>
                </ellipse>

                <ellipse
                  cx="142"
                  cy="76"
                  rx="30"
                  ry="18"
                  fill={isSelected('top', 'right') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('top', 'right') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('top', 'right')}
                  onMouseEnter={() => showHover('Top right', 140, 54)}
                  onMouseLeave={hideHover}
                >
                  <title>Top right</title>
                </ellipse>

                <ellipse
                  cx="128"
                  cy="214"
                  rx="22"
                  ry="14"
                  fill={isSelected('neck', 'right') ? selectedFill : hotspotFill}
                  stroke={
                    isSelected('neck', 'right') ? selectedStroke : hotspotStroke
                  }
                  strokeWidth="2"
                  style={hotspotCursor}
                  onClick={() => selectRegion('neck', 'right')}
                  onMouseEnter={() => showHover('Right neck', 124, 192)}
                  onMouseLeave={hideHover}
                >
                  <title>Right neck</title>
                </ellipse>
              </>
            )}

            {painRegion === 'back' ? (
              <g>
                <ellipse
                  cx="130"
                  cy="126"
                  rx="56"
                  ry="70"
                  fill="rgba(20, 184, 166, 0.14)"
                  stroke="#0F766E"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
                <text
                  x="130"
                  y="128"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill="#0F766E"
                >
                  Back selected
                </text>
              </g>
            ) : null}

            {hoveredHotspot ? (
              <g pointerEvents="none">
                <rect
                  x={hoveredHotspot.x - 44}
                  y={hoveredHotspot.y - 22}
                  rx="8"
                  ry="8"
                  width="88"
                  height="20"
                  fill="#0F172A"
                  opacity="0.92"
                />
                <text
                  x={hoveredHotspot.x}
                  y={hoveredHotspot.y - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#FFFFFF"
                >
                  {hoveredHotspot.label}
                </text>
              </g>
            ) : null}
          </svg>
        </div>

        <div style={{ width: '100%', maxWidth: '320px' }}>
          <label
            htmlFor="headTurn"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 700,
              fontSize: '14px',
              color: '#111827',
            }}
          >
            Turn head
          </label>

          <input
            id="headTurn"
            type="range"
            min={-90}
            max={90}
            step={1}
            value={viewAngle}
            onChange={(e) => setViewAngle(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#14B8A6',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748B',
              marginTop: '4px',
            }}
          >
            <span>Left side</span>
            <span>Front</span>
            <span>Right side</span>
          </div>
        </div>

        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#0F172A',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '10px 12px',
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center',
          }}
        >
          {helperText}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => {
              onChangeRegion('unknown')
              onChangeSide('unknown')
            }}
            style={{
              border: '1px solid #CBD5E1',
              borderRadius: '999px',
              padding: '8px 12px',
              background: '#FFFFFF',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeRegion('full_head')
              onChangeSide('both')
              setViewAngle(0)
            }}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '8px 12px',
              background: '#FEF3C7',
              color: '#92400E',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Whole head
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeRegion('back')
              onChangeSide('center')
              setViewAngle(90)
            }}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '8px 12px',
              background: '#E0F2FE',
              color: '#075985',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back of head
          </button>
        </div>
      </div>
    </div>
  )
}

export function LogHeadacheForm() {
  const [severity, setSeverity] = useState(5)
  const [occurredAt, setOccurredAt] = useState(toDateTimeLocalValue(new Date()))
  const [painSide, setPainSide] = useState<PainSide>('unknown')
  const [painRegion, setPainRegion] = useState<PainRegion>('unknown')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [triggerNotes, setTriggerNotes] = useState('')
  const [generalNotes, setGeneralNotes] = useState('')
  const [hospitalRelevant, setHospitalRelevant] = useState(false)

  const [medications, setMedications] = useState<Medication[]>([])
  const [medicationRows, setMedicationRows] = useState<MedicationLogRow[]>([])

  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadMedications() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from('medications')
          .select('id, name, default_dose, notes')
          .eq('user_id', user.id)
          .order('name', { ascending: true })

        if (error) throw error

        setMedications(data ?? [])
      } catch (err) {
        console.error('LOAD MEDICATIONS ERROR:', err)
      }
    }

    async function loadSymptoms() {
      try {
        const { data, error } = await supabase
          .from('symptoms')
          .select('id, label')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error

        setSymptoms(data ?? [])
      } catch (err) {
        console.error('LOAD SYMPTOMS ERROR:', err)
      }
    }

    loadMedications()
    loadSymptoms()
  }, [])

  function addMedicationRow() {
    setMedicationRows((current) => [...current, createEmptyMedicationRow()])
  }

  function removeMedicationRow(index: number) {
    setMedicationRows((current) => current.filter((_, i) => i !== index))
  }

  function updateMedicationRow(
    index: number,
    field: keyof MedicationLogRow,
    value: string
  ) {
    setMedicationRows((current) =>
      current.map((row, i) => {
        if (i !== index) return row

        const nextRow = { ...row, [field]: value }

        if (field === 'medication_id') {
          const selectedMedication = medications.find((m) => m.id === value)
          if (selectedMedication && !nextRow.dose.trim()) {
            nextRow.dose = selectedMedication.default_dose ?? ''
          }
        }

        return nextRow
      })
    )
  }

  function toggleSymptom(id: string) {
    setSelectedSymptoms((current) =>
      current.includes(id)
        ? current.filter((s) => s !== id)
        : [...current, id]
    )
  }

  async function handleSaveEntry() {
    try {
      setIsSaving(true)
      setError('')
      setMessage('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be signed in to save an entry.')
        return
      }

      const parsedDuration =
        durationMinutes.trim() === '' ? null : Number(durationMinutes)

      if (parsedDuration !== null && Number.isNaN(parsedDuration)) {
        setError('Duration must be a number.')
        return
      }

      if (parsedDuration !== null && parsedDuration < 0) {
        setError('Duration cannot be negative.')
        return
      }

      const payload = {
        user_id: user.id,
        occurred_at: new Date(occurredAt).toISOString(),
        severity_score: severity,
        pain_side: painSide,
        pain_region: painRegion,
        duration_minutes: parsedDuration,
        trigger_notes: triggerNotes.trim() || null,
        general_notes: generalNotes.trim() || null,
        hospital_relevant: hospitalRelevant,
      }

      const { data: entry, error: insertError } = await supabase
        .from('headache_entries')
        .insert([payload])
        .select('id')
        .single()

      if (insertError) {
        throw insertError
      }

      const medicationPayload = medicationRows
        .filter((row) => row.medication_id)
        .map((row) => ({
          entry_id: entry.id,
          medication_id: row.medication_id,
          dose: row.dose.trim() || null,
          taken_at: row.taken_at ? new Date(row.taken_at).toISOString() : null,
          helped:
            row.helped === 'yes' ? true : row.helped === 'no' ? false : null,
          notes: row.notes.trim() || null,
        }))

      if (medicationPayload.length > 0) {
        const { error: medicationInsertError } = await supabase
          .from('entry_medications')
          .insert(medicationPayload)

        if (medicationInsertError) {
          throw medicationInsertError
        }
      }

      if (selectedSymptoms.length > 0) {
        const symptomPayload = selectedSymptoms.map((symptom_id) => ({
          entry_id: entry.id,
          symptom_id,
        }))

        const { error: symptomInsertError } = await supabase
          .from('entry_symptoms')
          .insert(symptomPayload)

        if (symptomInsertError) {
          throw symptomInsertError
        }
      }

      setMessage('Entry saved!')
      setSeverity(5)
      setOccurredAt(toDateTimeLocalValue(new Date()))
      setPainSide('unknown')
      setPainRegion('unknown')
      setDurationMinutes('')
      setTriggerNotes('')
      setGeneralNotes('')
      setHospitalRelevant(false)
      setMedicationRows([])
      setSelectedSymptoms([])
    } catch (err) {
      console.error('SAVE ERROR:', err)
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '18px',
      }}
    >
      <SeveritySelector value={severity} onChange={setSeverity} />

      <div style={cardStyle()}>
        <label
          htmlFor="occurredAt"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 700,
            fontSize: '16px',
            color: '#111827',
          }}
        >
          When did it happen?
        </label>

        <input
          id="occurredAt"
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid #CBD5E1',
            fontSize: '15px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <HeadPainSelector
        painSide={painSide}
        painRegion={painRegion}
        onChangeSide={setPainSide}
        onChangeRegion={setPainRegion}
      />

      <div style={cardStyle()}>
        <label
          htmlFor="durationMinutes"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 700,
            fontSize: '16px',
            color: '#111827',
          }}
        >
          Duration in minutes
        </label>

        <input
          id="durationMinutes"
          type="number"
          min="0"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="e.g. 45"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid #CBD5E1',
            fontSize: '15px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={cardStyle()}>
        <label
          htmlFor="triggerNotes"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 700,
            fontSize: '16px',
            color: '#111827',
          }}
        >
          Possible triggers
        </label>

        <textarea
          id="triggerNotes"
          value={triggerNotes}
          onChange={(e) => setTriggerNotes(e.target.value)}
          rows={4}
          placeholder="Stress, dehydration, lack of sleep, foods, etc."
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            resize: 'vertical',
            fontSize: '15px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={cardStyle()}>
        <div
          style={{
            fontWeight: 700,
            fontSize: '16px',
            color: '#111827',
            marginBottom: '12px',
          }}
        >
          Symptoms
        </div>

        {symptoms.length === 0 ? (
          <div style={{ color: '#64748B', fontSize: '14px' }}>
            No symptoms available.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '10px',
            }}
          >
            {symptoms.map((symptom) => (
              <label
                key={symptom.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSymptoms.includes(symptom.id)}
                  onChange={() => toggleSymptom(symptom.id)}
                />
                {symptom.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: '16px',
              color: '#111827',
            }}
          >
            Medication
          </div>

          <button
            type="button"
            onClick={addMedicationRow}
            style={{
              border: 'none',
              borderRadius: '12px',
              background: '#14B8A6',
              color: '#FFFFFF',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add medication
          </button>
        </div>

        {medicationRows.length === 0 ? (
          <div
            style={{
              color: '#64748B',
              fontSize: '14px',
            }}
          >
            No medication added for this entry.
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gap: '14px',
          }}
        >
          {medicationRows.map((row, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '14px',
                display: 'grid',
                gap: '12px',
                background: '#F8FAFC',
              }}
            >
              <div style={{ display: 'grid', gap: '8px' }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#111827',
                  }}
                >
                  Medication
                </label>
                <select
                  value={row.medication_id}
                  onChange={(e) =>
                    updateMedicationRow(index, 'medication_id', e.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '15px',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select medication</option>
                  {medications.map((medication) => (
                    <option key={medication.id} value={medication.id}>
                      {medication.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#111827',
                  }}
                >
                  Dose
                </label>
                <input
                  type="text"
                  value={row.dose}
                  onChange={(e) =>
                    updateMedicationRow(index, 'dose', e.target.value)
                  }
                  placeholder="e.g. 50mg"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#111827',
                  }}
                >
                  Taken at
                </label>
                <input
                  type="datetime-local"
                  value={row.taken_at}
                  onChange={(e) =>
                    updateMedicationRow(index, 'taken_at', e.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    background: '#FFFFFF',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#111827',
                  }}
                >
                  Did it help?
                </label>
                <select
                  value={row.helped}
                  onChange={(e) =>
                    updateMedicationRow(index, 'helped', e.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '15px',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Not recorded</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#111827',
                  }}
                >
                  Medication notes
                </label>
                <textarea
                  value={row.notes}
                  onChange={(e) =>
                    updateMedicationRow(index, 'notes', e.target.value)
                  }
                  rows={3}
                  placeholder="Any notes about this medication..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    resize: 'vertical',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => removeMedicationRow(index)}
                style={{
                  justifySelf: 'start',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  color: '#DC2626',
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyle()}>
        <label
          htmlFor="generalNotes"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 700,
            fontSize: '16px',
            color: '#111827',
          }}
        >
          Notes
        </label>

        <textarea
          id="generalNotes"
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          rows={5}
          placeholder="Anything else you want to record..."
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            resize: 'vertical',
            fontSize: '15px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={cardStyle()}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '15px',
            color: '#111827',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={hospitalRelevant}
            onChange={(e) => setHospitalRelevant(e.target.checked)}
          />
          Hospital relevant
        </label>
      </div>

      <button
        type="button"
        onClick={handleSaveEntry}
        disabled={isSaving}
        style={{
          width: '100%',
          minHeight: '52px',
          border: 'none',
          borderRadius: '14px',
          background: isSaving ? '#94A3B8' : '#14B8A6',
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 700,
          cursor: isSaving ? 'not-allowed' : 'pointer',
          boxShadow: '0 8px 20px rgba(20, 184, 166, 0.2)',
        }}
      >
        {isSaving ? 'Saving...' : 'Save Entry'}
      </button>

      {error ? (
        <div style={{ color: '#DC2626', fontWeight: 500 }}>{error}</div>
      ) : null}

      {message ? (
        <div style={{ color: '#059669', fontWeight: 600 }}>{message}</div>
      ) : null}
    </div>
  )
}