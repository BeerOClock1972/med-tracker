import { useEffect, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { LogHeadacheForm } from './components/LogHeadacheForm'
import { InsightsPage } from './components/InsightsPage'
import { supabase } from './lib/supabase'
import logo from './assets/med-tracker-logo.png'

type Tab = 'log' | 'insights'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('log')

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      setIsSignedIn(!!session)
      setIsLoading(false)
    }

    void checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setIsSignedIn(!!session)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  function tabButtonStyle(tab: Tab) {
    const isActive = activeTab === tab

    return {
      flex: '1 1 140px',
      minWidth: 0,
      border: 'none',
      borderRadius: '999px',
      padding: '12px 16px',
      background: isActive ? '#14B8A6' : '#E2E8F0',
      color: isActive ? '#FFFFFF' : '#0F172A',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as const
  }

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#F5F7FA',
          display: 'grid',
          placeItems: 'center',
          color: '#1A1A1A',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div>Loading Med Tracker...</div>
      </main>
    )
  }

  if (!isSignedIn) {
    return <AuthScreen />
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F5F7FA',
        padding: '24px 16px 40px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#1A1A1A',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <img
            src={logo}
            alt="Med Tracker"
            style={{
              width: '220px',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>

        <section
          style={{
            background: 'linear-gradient(135deg, #1E5A96, #1FA3A3)',
            borderRadius: '24px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 12px 30px rgba(30, 90, 150, 0.18)',
            marginBottom: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: '16px',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  opacity: 0.9,
                }}
              >
                Med Tracker
              </p>

              <h1
                style={{
                  margin: '8px 0 10px',
                  fontSize: '28px',
                  lineHeight: 1.1,
                }}
              >
                {activeTab === 'log' ? 'Log a headache' : 'Insights'}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: 1.5,
                  opacity: 0.95,
                }}
              >
                {activeTab === 'log'
                  ? 'Record severity, symptoms, pain location, medication, and notes in one place.'
                  : 'See patterns in headaches, symptom trends, and severity over time.'}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  border: '1px solid rgba(255,255,255,0.28)',
                  background: 'rgba(255,255,255,0.14)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '10px',
            marginBottom: '20px',
            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            style={tabButtonStyle('log')}
          >
            Log headache
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            style={tabButtonStyle('insights')}
          >
            Insights
          </button>
        </div>

        <div
          style={{
            width: '100%',
            minWidth: 0,
          }}
        >
          {activeTab === 'log' ? <LogHeadacheForm /> : <InsightsPage />}
        </div>
      </div>
    </main>
  )
}

export default App