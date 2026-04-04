import { useEffect, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { LogHeadacheForm } from './components/LogHeadacheForm'
import { supabase } from './lib/supabase'
import logo from './assets/med-tracker-logo.png'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)

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
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          margin: '0 auto',
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
          }}
        >
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
            Log a headache
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.5,
              opacity: 0.95,
            }}
          >
            Record severity, symptoms, pain location, medication, and notes in
            one place.
          </p>
        </section>

        <LogHeadacheForm />
      </div>
    </main>
  )
}

export default App