import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthScreen() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsLoading(true)
      setError('')
      setMessage('')

      const trimmedEmail = email.trim()

      if (!trimmedEmail) {
        setError('Please enter your email address.')
        return
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
      })

      if (error) {
        throw error
      }

      setMessage('Check your email for the sign-in link.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send sign-in link.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F5F7FA',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#1A1A1A',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'grid',
          gap: '16px',
        }}
      >
        <section
          style={{
            background: 'linear-gradient(135deg, #1E5A96, #1FA3A3)',
            borderRadius: '24px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 12px 30px rgba(30, 90, 150, 0.18)',
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
            Sign in
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.5,
              opacity: 0.95,
            }}
          >
            Enter your email to get a magic sign-in link.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(17, 24, 39, 0.08)',
            display: 'grid',
            gap: '12px',
          }}
        >
          <label
            htmlFor="email"
            style={{
              fontSize: '14px',
              color: '#4B5563',
            }}
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
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

          {error ? (
            <div
              style={{
                borderRadius: '12px',
                padding: '12px',
                background: '#FEE2E2',
                color: '#991B1B',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          ) : null}

          {message ? (
            <div
              style={{
                borderRadius: '12px',
                padding: '12px',
                background: '#DCFCE7',
                color: '#166534',
                fontSize: '14px',
              }}
            >
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              border: 'none',
              background: isLoading
                ? '#93C5FD'
                : 'linear-gradient(135deg, #1E5A96, #1FA3A3)',
              color: '#ffffff',
              borderRadius: '18px',
              minHeight: '48px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Sending link...' : 'Send magic link'}
          </button>
        </form>
      </div>
    </main>
  )
}