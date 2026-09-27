import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [member, setMember] = useState(null)
  const [membershipChecked, setMembershipChecked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const sessionRef = useRef(null)
  const userId = session?.user?.id ?? null

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return

      if (error) {
        setErrorMessage(error.message)
      }

      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      const currentUserId = sessionRef.current?.user?.id
      const nextUserId = nextSession?.user?.id
      const sameUser = Boolean(currentUserId) && currentUserId === nextUserId

      if (event === 'SIGNED_OUT' || !sameUser) {
        setMember(null)
        setMembershipChecked(false)
      }

      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      return
    }

    let cancelled = false

    async function checkMembership() {
      setErrorMessage('')

      const { data, error } = await supabase
        .from('team_members')
        .select('user_id, display_name, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        setErrorMessage(error.message)
        setMember(null)
      } else {
        setMember(data)
      }

      setMembershipChecked(true)
    }

    checkMembership()

    return () => {
      cancelled = true
    }
  }, [userId])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
    }

    setSubmitting(false)
  }

  if (loading || (session && !membershipChecked && !member)) {
    return <p>Checking access...</p>
  }

  if (!session) {
    return (
      <main>
        <h1>Calendario</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage && <p>{errorMessage}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </main>
    )
  }

  if (!member) {
    return (
      <main>
        <h1>Access denied</h1>
        <p>
          Your account is authenticated but is not an active Calendario team
          member.
        </p>

        {errorMessage && <p>{errorMessage}</p>}

        <button type="button" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </main>
    )
  }

  return children
}
