import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState(prev => ({ ...prev, user: data.session?.user ?? null, loading: false }))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, user: session?.user ?? null }))
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, error: null, loading: true }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState(prev => ({ ...prev, user: null }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Convenience: returns true if user is signed in */
export function useIsAdmin(): boolean {
  const { user } = useAuth()
  return user !== null
}
