import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface Notification {
  id: string
  type: 'payment' | 'link_created' | 'link_expired' | 'gateway_connected' | 'withdraw'
  title: string
  message: string
  timestamp: string
  read: boolean
  amount?: number
}

interface NotificationsState {
  notifications: Notification[]
  showPermission: boolean
  pushEnabled: boolean
  setShowPermission: (val: boolean) => void
  setPushEnabled: (val: boolean) => void
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearAll: () => Promise<void>
  unreadCount: () => number
  subscribeToRealtime: () => () => void
  loadFromSupabase: () => Promise<void>
  requestPushPermission: () => Promise<boolean>
  sendBrowserPush: (title: string, body: string, icon?: string) => void
}

const genId = () => 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5)

// Send a real browser push notification if permission is granted
function firePush(title: string, body: string, icon = '/pagesgopay/icon.svg') {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    // Use ServiceWorker if available for background push
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          tag: 'gopay-notif',
        })
      }).catch(() => {
        new Notification(title, { body, icon })
      })
    } else {
      new Notification(title, { body, icon })
    }
  } catch {}
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      showPermission: true,
      pushEnabled: false,

      setShowPermission: (val) => set({ showPermission: val }),
      setPushEnabled: (val) => set({ pushEnabled: val }),

      requestPushPermission: async () => {
        if (!('Notification' in window)) return false
        if (Notification.permission === 'granted') {
          set({ pushEnabled: true, showPermission: false })
          firePush('GoPay', 'Notificações ativadas com sucesso! 🎉')
          return true
        }
        if (Notification.permission === 'denied') return false
        const perm = await Notification.requestPermission()
        if (perm === 'granted') {
          set({ pushEnabled: true, showPermission: false })
          firePush('GoPay', 'Notificações ativadas com sucesso! 🎉')
          return true
        }
        return false
      },

      sendBrowserPush: (title, body, icon) => {
        if (get().pushEnabled) firePush(title, body, icon)
      },

      loadFromSupabase: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).maybeSingle()
          if (!profile) return
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(100)
          if (data) {
            const mapped = data.map((n: any) => ({
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              timestamp: n.created_at,
              read: n.read,
              amount: n.amount ?? undefined,
            }))
            set({ notifications: mapped })
          }
        } catch {}
      },

      subscribeToRealtime: () => {
        // Remove any existing channel first
        supabase.getChannels().forEach((ch) => {
          if (ch.topic === 'realtime:gopay-notifications') {
            supabase.removeChannel(ch)
          }
        })

        const channel = supabase
          .channel('gopay-notifications')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications' },
            (payload: any) => {
              const n = payload.new
              if (!n) return
              const notif: Notification = {
                id: n.id || genId(),
                type: n.type,
                title: n.title,
                message: n.message,
                timestamp: n.created_at || new Date().toISOString(),
                read: n.read ?? false,
                amount: n.amount ?? undefined,
              }
              // Avoid duplicates
              const exists = get().notifications.some((x) => x.id === notif.id)
              if (!exists) {
                set((state) => ({ notifications: [notif, ...state.notifications] }))
                // Fire browser push for realtime events
                get().sendBrowserPush(notif.title, notif.message)
              }
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('[GoPay] Realtime notifications connected')
            }
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              // Retry after 5s
              setTimeout(() => {
                supabase.removeChannel(channel)
                get().subscribeToRealtime()
              }, 5000)
            }
          })

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

        // Fire browser push immediately
        get().sendBrowserPush(n.title, n.message)

        // Persist to Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).maybeSingle()
          if (!profile) return
          await supabase.from('notifications').insert({
            user_id: profile.id,
            type: n.type,
            title: n.title,
            message: n.message,
            amount: n.amount ?? null,
          })
        } catch {}
      },

      markAsRead: async (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
        }))
        try {
          await supabase.from('notifications').update({ read: true }).eq('id', id)
        } catch {}
      },

      markAllAsRead: async () => {
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }))
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).maybeSingle()
          if (!profile) return
          await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false)
        } catch {}
      },

      clearAll: async () => {
        set({ notifications: [] })
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).maybeSingle()
          if (!profile) return
          await supabase.from('notifications').delete().eq('user_id', profile.id)
        } catch {}
      },

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'gopay-notifications' }
  )
)
