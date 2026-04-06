import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
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

      if (!trimmedEmail || !password) {
        setError('Please enter email and password.')
        return
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        })

        if (error) throw error

        setMessage('Account created! You can now sign in.')
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })

        if (error) throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#F5F7FA',
      display: 'grid',
      placeItems: 'center',
      padding: '24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', display: 'grid', gap: '16px' }}>
        
        <section style={{
          background: 'linear-gradient(135deg, #1E5A96, #1FA3A3)',
          borderRadius: '24px',
          padding: '24px',
          color: '#fff',
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Med Tracker</p>
          <h1 style={{ margin: '8px 0', fontSize: '28px' }}>
            {isSignUp ? 'Create account' : 'Sign in'}
          </h1>
          <p style={{ margin: 0 }}>
            {isSignUp
              ? 'Create an account to start tracking.'
              : 'Welcome back!'}
          </p>
        </section>

        <form onSubmit={handleSubmit} style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '20px',
          display: 'grid',
          gap: '12px',
        }}>
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div style={{ color: 'red' }}>{error}</div>}
          {message && <div style={{ color: 'green' }}>{message}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Loading...'
              : isSignUp
              ? 'Create account'
              : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1E5A96',
              cursor: 'pointer',
            }}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : 'No account? Create one'}
          </button>
        </form>
      </div>
    </main>
  )
}