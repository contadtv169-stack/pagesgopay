import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface Notification {
  id: string
  type: 'payment' | 'link_created' | 'link_expired' | 'gateway_connected'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface NotificationsState {
  notifications: Notification[]
  showPermission: boolean
  setShowPermission: (val: boolean) => void
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearAll: () => Promise<void>
  unreadCount: () => number
  subscribeToRealtime: () => () => void
  loadFromSupabase: () => Promise<void>
}

const genId = () => 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5)

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      showPermission: true,

      setShowPermission: (val) => set({ showPermission: val }),

      loadFromSupabase: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
            if (profile) {
              const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(50)
              if (data) {
                const mapped = data.map((n: any) => ({
                  id: n.id,
                  type: n.type,
                  title: n.title,
                  message: n.message,
                  timestamp: n.created_at,
                  read: n.read,
                }))
                set({ notifications: mapped })
              }
            }
          }
        } catch {}
      },

      subscribeToRealtime: () => {
        const channel = supabase
          .channel('notifications-realtime')
          .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: undefined },
            (payload: any) => {
              const n = payload.new
              const notif: Notification = {
                id: n.id || genId(),
                type: n.type,
                title: n.title,
                message: n.message,
                timestamp: n.created_at || new Date().toISOString(),
                read: n.read || false,
              }
              set((state) => ({ notifications: [notif, ...state.notifications] }))
            }
          )
          .subscribe()

        return () => { supabase.removeChannel(channel) }
      },

      addNotification: async (notif) => {
        const n: Notification = {
          id: genId(),
          ...notif,
          timestamp: new Date().toISOString(),
          read: false,
        }
        set((state) => ({ notifications: [n, ...state.notifications] }))

        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
            if (profile) {
              await supabase.from('notifications').insert({
                user_id: profile.id,
                type: n.type,
                title: n.title,
                message: n.message,
              })
            }
          }
        } catch {}
      },

      markAllAsRead: async () => {
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }))
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
            if (profile) {
              await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false)
            }
          }
        } catch {}
      },

      clearAll: async () => {
        set({ notifications: [] })
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
            if (profile) {
              await supabase.from('notifications').delete().eq('user_id', profile.id)
            }
          }
        } catch {}
      },

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'gopay-notifications' }
  )
)
