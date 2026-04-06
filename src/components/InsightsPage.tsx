import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

type TimeRange = '7d' | '30d' | '90d' | 'all'

type HeadacheEntry = {
  id: string
  occurred_at: string
  severity_score: number
  hospital_relevant: boolean | null
}

type SymptomJoinRow = {
  symptom_id: string
  symptoms: {
    id: string
    label: string
  } | null
}

type DailyRow = {
  date: string
  mild: number
  moderate: number
  severe: number
  verySevere: number
  averageSeverity: number
  total: number
}

type SymptomPieRow = {
  name: string
  value: number
}

function getSeverityBucket(score: number) {
  if (score >= 1 && score <= 3) return 'mild'
  if (score >= 4 && score <= 6) return 'moderate'
  if (score >= 7 && score <= 8) return 'severe'
  return 'verySevere'
}

function getRangeStart(range: TimeRange) {
  const now = new Date()
  const start = new Date(now)

  if (range === '7d') start.setDate(now.getDate() - 6)
  if (range === '30d') start.setDate(now.getDate() - 29)
  if (range === '90d') start.setDate(now.getDate() - 89)
  if (range === 'all') return null

  start.setHours(0, 0, 0, 0)
  return start
}

function formatLocalDay(value: string) {
  const d = new Date(value)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function getLocalDateKey(value: string) {
  const d = new Date(value)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function cardStyle(): React.CSSProperties {
  return {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '14px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  }
}

function statCardStyle(): React.CSSProperties {
  return {
    ...cardStyle(),
    padding: '14px',
  }
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint
  })

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}

export function InsightsPage() {
  const [range, setRange] = useState<TimeRange>('30d')
  const [entries, setEntries] = useState<HeadacheEntry[]>([])
  const [symptomRows, setSymptomRows] = useState<SymptomJoinRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const isMobile = useIsMobile()

  useEffect(() => {
    async function loadInsights() {
      try {
        setIsLoading(true)
        setError('')

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('You must be signed in to view insights.')
          return
        }

        const start = getRangeStart(range)

        let entriesQuery = supabase
          .from('headache_entries')
          .select('id, occurred_at, severity_score, hospital_relevant')
          .eq('user_id', user.id)
          .order('occurred_at', { ascending: true })

        if (start) {
          entriesQuery = entriesQuery.gte('occurred_at', start.toISOString())
        }

        const { data: entriesData, error: entriesError } = await entriesQuery
        if (entriesError) throw entriesError

        const entryIds = (entriesData ?? []).map((entry) => entry.id)

        let symptomData: SymptomJoinRow[] = []

        if (entryIds.length > 0) {
          const { data: joinedSymptoms, error: symptomsError } = await supabase
            .from('entry_symptoms')
            .select(`
              symptom_id,
              symptoms (
                id,
                label
              )
            `)
            .in('entry_id', entryIds)

          if (symptomsError) throw symptomsError
          symptomData = (joinedSymptoms as SymptomJoinRow[]) ?? []
        }

        setEntries((entriesData as HeadacheEntry[]) ?? [])
        setSymptomRows(symptomData)
      } catch (err) {
        console.error('LOAD INSIGHTS ERROR:', err)
        setError(err instanceof Error ? err.message : 'Failed to load insights')
      } finally {
        setIsLoading(false)
      }
    }

    loadInsights()
  }, [range])

  const dailyData = useMemo<DailyRow[]>(() => {
    const grouped: Record<
      string,
      {
        date: string
        mild: number
        moderate: number
        severe: number
        verySevere: number
        totalSeverity: number
        total: number
      }
    > = {}

    for (const entry of entries) {
      const key = getLocalDateKey(entry.occurred_at)

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          mild: 0,
          moderate: 0,
          severe: 0,
          verySevere: 0,
          totalSeverity: 0,
          total: 0,
        }
      }

      const bucket = getSeverityBucket(entry.severity_score)
      grouped[key][bucket] += 1
      grouped[key].total += 1
      grouped[key].totalSeverity += entry.severity_score
    }

    return Object.values(grouped)
      .map((row) => ({
        date: row.date,
        mild: row.mild,
        moderate: row.moderate,
        severe: row.severe,
        verySevere: row.verySevere,
        total: row.total,
        averageSeverity:
          row.total > 0
            ? Number((row.totalSeverity / row.total).toFixed(1))
            : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [entries])

  const symptomPieData = useMemo<SymptomPieRow[]>(() => {
    const counts: Record<string, number> = {}

    for (const row of symptomRows) {
      const label = row.symptoms?.label ?? 'Unknown'
      counts[label] = (counts[label] ?? 0) + 1
    }

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [symptomRows])

  const totalHeadaches = entries.length

  const averageSeverity = useMemo(() => {
    if (entries.length === 0) return 0
    const total = entries.reduce((sum, entry) => sum + entry.severity_score, 0)
    return Number((total / entries.length).toFixed(1))
  }, [entries])

  const hospitalRelevantCount = useMemo(() => {
    return entries.filter((entry) => entry.hospital_relevant).length
  }, [entries])

  const worstDay = useMemo(() => {
    if (dailyData.length === 0) return '—'
    const sorted = [...dailyData].sort((a, b) => {
      if (b.averageSeverity !== a.averageSeverity) {
        return b.averageSeverity - a.averageSeverity
      }
      return b.total - a.total
    })
    return formatLocalDay(sorted[0].date)
  }, [dailyData])

  const mostCommonSymptom = symptomPieData[0]?.name ?? '—'

  const pieColours = [
    '#14B8A6',
    '#60A5FA',
    '#F59E0B',
    '#F97316',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#84CC16',
  ]

  const barChartMinWidth = Math.max(dailyData.length * (isMobile ? 34 : 30), 280)
  const lineChartMinWidth = Math.max(dailyData.length * (isMobile ? 34 : 30), 280)
  const topSymptoms = symptomPieData.slice(0, 6)

  return (
    <div
      style={{
        display: 'grid',
        gap: '16px',
        width: '100%',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '12px',
          width: '100%',
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? '22px' : '24px',
              color: '#111827',
            }}
          >
            Insights
          </h2>
          <div
            style={{
              color: '#64748B',
              marginTop: '6px',
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          >
            See patterns in headaches, severity, and symptoms.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '10px 12px',
                background: range === option ? '#14B8A6' : '#E2E8F0',
                color: range === option ? '#FFFFFF' : '#0F172A',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {option === 'all' ? 'All time' : option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div style={{ color: '#DC2626', fontWeight: 600 }}>{error}</div>
      ) : null}

      {isLoading ? (
        <div style={cardStyle()}>Loading insights…</div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(2, minmax(0, 1fr))'
                : 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              width: '100%',
              minWidth: 0,
            }}
          >
            <div style={statCardStyle()}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Total headaches
              </div>
              <div
                style={{
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: 800,
                  color: '#111827',
                  marginTop: '6px',
                }}
              >
                {totalHeadaches}
              </div>
            </div>

            <div style={statCardStyle()}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Average severity
              </div>
              <div
                style={{
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: 800,
                  color: '#111827',
                  marginTop: '6px',
                }}
              >
                {averageSeverity || '0'}
              </div>
            </div>

            <div style={statCardStyle()}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Worst day</div>
              <div
                style={{
                  fontSize: isMobile ? '18px' : '28px',
                  fontWeight: 800,
                  color: '#111827',
                  marginTop: '8px',
                  lineHeight: 1.15,
                }}
              >
                {worstDay}
              </div>
            </div>

            <div style={statCardStyle()}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Most common symptom
              </div>
              <div
                style={{
                  fontSize: isMobile ? '15px' : '20px',
                  fontWeight: 800,
                  color: '#111827',
                  marginTop: '10px',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {mostCommonSymptom}
              </div>
            </div>

            <div
              style={{
                ...statCardStyle(),
                gridColumn: isMobile ? '1 / -1' : undefined,
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Hospital relevant
              </div>
              <div
                style={{
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: 800,
                  color: '#111827',
                  marginTop: '6px',
                }}
              >
                {hospitalRelevantCount}
              </div>
            </div>
          </div>

          <div style={cardStyle()}>
            <div
              style={{
                fontWeight: 700,
                fontSize: isMobile ? '17px' : '18px',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              Headaches by day
            </div>

            <div
              style={{
                color: '#64748B',
                fontSize: '13px',
                marginBottom: '12px',
              }}
            >
              {isMobile
                ? 'Scroll sideways if needed.'
                : 'Daily headache count split by severity.'}
            </div>

            {dailyData.length === 0 ? (
              <div style={{ color: '#64748B' }}>
                No headache data yet for this period.
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div
                  style={{
                    minWidth: `${barChartMinWidth}px`,
                    height: isMobile ? '250px' : '320px',
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyData}
                      margin={{
                        top: 8,
                        right: 8,
                        left: isMobile ? -24 : -8,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatLocalDay}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        interval="preserveStartEnd"
                        minTickGap={24}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        width={isMobile ? 22 : 32}
                      />
                      <Tooltip
                        labelFormatter={(label) => formatLocalDay(String(label))}
                      />
                      {!isMobile ? <Legend /> : null}
                      <Bar dataKey="mild" stackId="severity" fill="#22C55E" name="Mild" />
                      <Bar dataKey="moderate" stackId="severity" fill="#EAB308" name="Moderate" />
                      <Bar dataKey="severe" stackId="severity" fill="#F97316" name="Severe" />
                      <Bar dataKey="verySevere" stackId="severity" fill="#DC2626" name="Very severe" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {isMobile && dailyData.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px 12px',
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#475569',
                }}
              >
                <span>🟢 Mild</span>
                <span>🟡 Moderate</span>
                <span>🟠 Severe</span>
                <span>🔴 Very severe</span>
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '16px',
              width: '100%',
              minWidth: 0,
            }}
          >
            <div style={cardStyle()}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: isMobile ? '17px' : '18px',
                  color: '#111827',
                  marginBottom: '14px',
                }}
              >
                Symptom breakdown
              </div>

              {symptomPieData.length === 0 ? (
                <div style={{ color: '#64748B' }}>
                  No symptom data yet for this period.
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: '100%',
                      height: isMobile ? 220 : 320,
                      minWidth: 0,
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topSymptoms}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={isMobile ? 70 : 100}
                          innerRadius={isMobile ? 24 : 34}
                          paddingAngle={2}
                          label={!isMobile}
                          labelLine={!isMobile}
                        >
                          {topSymptoms.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={pieColours[index % pieColours.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        {!isMobile ? <Legend /> : null}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {isMobile ? (
                    <div
                      style={{
                        display: 'grid',
                        gap: '8px',
                        marginTop: '12px',
                      }}
                    >
                      {topSymptoms.map((item, index) => (
                        <div
                          key={item.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            fontSize: '14px',
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '999px',
                                background:
                                  pieColours[index % pieColours.length],
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                color: '#111827',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.name}
                            </span>
                          </div>

                          <span
                            style={{
                              color: '#64748B',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div style={cardStyle()}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: isMobile ? '17px' : '18px',
                  color: '#111827',
                  marginBottom: '8px',
                }}
              >
                Average severity trend
              </div>

              <div
                style={{
                  color: '#64748B',
                  fontSize: '13px',
                  marginBottom: '12px',
                }}
              >
                {isMobile
                  ? 'Scroll sideways if needed.'
                  : 'Average headache severity for each day.'}
              </div>

              {dailyData.length === 0 ? (
                <div style={{ color: '#64748B' }}>
                  No severity data yet for this period.
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <div
                    style={{
                      minWidth: `${lineChartMinWidth}px`,
                      height: isMobile ? '240px' : '300px',
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyData}
                        margin={{
                          top: 8,
                          right: 8,
                          left: isMobile ? -24 : -8,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatLocalDay}
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          interval="preserveStartEnd"
                          minTickGap={24}
                        />
                        <YAxis
                          domain={[0, 10]}
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          width={isMobile ? 22 : 32}
                        />
                        <Tooltip
                          labelFormatter={(label) => formatLocalDay(String(label))}
                        />
                        {!isMobile ? <Legend /> : null}
                        <Line
                          type="monotone"
                          dataKey="averageSeverity"
                          stroke="#8B5CF6"
                          strokeWidth={3}
                          dot={{ r: isMobile ? 2 : 4 }}
                          name="Average severity"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {isMobile && dailyData.length > 0 ? (
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: '#475569',
                  }}
                >
                  🟣 Average severity
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  )
}