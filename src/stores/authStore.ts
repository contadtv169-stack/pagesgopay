import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface User {
  id?: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .maybeSingle()
          if (profile && !error) {
            set({ user: { id: profile.id, name: profile.name, email: profile.email }, isAuthenticated: true })
          }
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          if (data.user) {
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('auth_id', data.user.id)
              .maybeSingle()
            if (profile && !error) {
              set({ user: { id: profile.id, name: profile.name, email: profile.email }, isAuthenticated: true, loading: false })
              return true
            }
            set({ user: { name: data.user.email || '', email: data.user.email || '' }, isAuthenticated: true, loading: false })
            return true
          }
          throw new Error('Perfil não encontrado')
        } catch (err: any) {
          set({ loading: false, error: err.message || 'Erro ao fazer login' })
          return false
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({ email, password })
          if (error) throw error
          if (data.user) {
            const { error: profileError } = await supabase.from('users').insert({
              auth_id: data.user.id,
              name,
              email,
            })
            if (profileError) throw profileError
            set({ user: { name, email }, isAuthenticated: true, loading: false })
            return true
          }
          throw new Error('Erro ao criar conta')
        } catch (err: any) {
          set({ loading: false, error: err.message || 'Erro ao criar conta' })
          return false
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false })
      },
    }),
    { name: 'gopay-auth' }
  )
)
