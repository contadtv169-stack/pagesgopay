import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface PaymentLink {
  id: string
  amount: number
  description: string
  slug: string
  url: string
  expiration: string
  status: 'active' | 'expired'
  transactionId?: string
  qrCodeBase64?: string
  copyPaste?: string
  paymentLink?: string
  views: number
  payments: number
  createdAt: string
  expiresAt?: string
  gatewayType?: string
}

interface LinksState {
  links: PaymentLink[]
  loading: boolean
  fetchLinks: () => Promise<void>
  createLink: (data: Omit<PaymentLink, 'id' | 'createdAt' | 'views' | 'payments' | 'status' | 'url'> & {
    transactionId?: string; qrCodeBase64?: string; copyPaste?: string; paymentLink?: string
  }) => Promise<PaymentLink | null>
  updateLink: (id: string, data: Partial<PaymentLink>) => Promise<void>
  deleteLink: (id: string) => Promise<void>
  getLink: (id: string) => PaymentLink | undefined
}

const generateSlug = () => 'link_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)

function getLocalId() {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}

export const useLinksStore = create<LinksState>()(
  persist(
    (set, get) => ({
      links: [],
      loading: false,

      fetchLinks: async () => {
        set({ loading: true })
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
            if (profile) {
              const { data } = await supabase.from('payment_links').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
              if (data) {
                const mapped = data.map((item: any) => ({
                  id: item.id,
                  amount: Number(item.amount),
                  description: item.description,
                  slug: item.slug,
                  url: item.url,
                  expiration: item.expiration,
                  status: item.status,
                  transactionId: item.transaction_id,
                  qrCodeBase64: item.qr_code_base64,
                  copyPaste: item.copy_paste,
                  paymentLink: item.payment_link,
                  views: item.views,
                  payments: item.payments,
                  createdAt: item.created_at,
                  expiresAt: item.expires_at,
                  gatewayType: item.gateway_type,
                }))
                set({ links: mapped, loading: false })
                return
              }
            }
          }
        } catch {}
        set({ loading: false })
      },

      createLink: async (data) => {
        const now = new Date()
        let expiresAt: string | undefined
        if (data.expiration !== 'never') {
          const d = new Date(now)
          const days = parseInt(data.expiration)
          if (!isNaN(days)) d.setDate(d.getDate() + days)
          expiresAt = d.toISOString()
        }

        const linkData = {
          amount: data.amount,
          description: data.description,
          slug: data.slug || generateSlug(),
          url: `https://gopay.me/${data.slug || generateSlug()}`,
          expiration: data.expiration,
          status: 'active' as const,
          transaction_id: data.transactionId,
          qr_code_base64: data.qrCodeBase64,
          copy_paste: data.copyPaste,
          payment_link: data.paymentLink,
          gateway_type: data.gatewayType,
          expires_at: expiresAt,
        }

        linkData.url = `https://gopay.me/${linkData.slug}`

        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
            if (profile) {
              const { data: inserted, error } = await supabase.from('payment_links').insert({
                ...linkData,
                user_id: profile.id,
              }).select().single()

              if (!error && inserted) {
                const link: PaymentLink = {
                  id: inserted.id,
                  amount: Number(inserted.amount),
                  description: inserted.description,
                  slug: inserted.slug,
                  url: inserted.url,
                  expiration: inserted.expiration,
                  status: inserted.status,
                  views: inserted.views,
                  payments: inserted.payments,
                  createdAt: inserted.created_at,
                  expiresAt: inserted.expires_at,
                  transactionId: inserted.transaction_id,
                  qrCodeBase64: inserted.qr_code_base64,
                  copyPaste: inserted.copy_paste,
                  paymentLink: inserted.payment_link,
                }
                set((state) => ({ links: [link, ...state.links] }))
                return link
              }
            }
          }
        } catch {}

        const localLink: PaymentLink = {
          id: getLocalId(),
          amount: data.amount,
          description: data.description,
          slug: linkData.slug,
          url: linkData.url,
          expiration: data.expiration,
          status: 'active',
          views: 0,
          payments: 0,
          createdAt: now.toISOString(),
          expiresAt,
          transactionId: data.transactionId,
          qrCodeBase64: data.qrCodeBase64,
          copyPaste: data.copyPaste,
          paymentLink: data.paymentLink,
        }
        set((state) => ({ links: [localLink, ...state.links] }))
        return localLink
      },

      updateLink: async (id, data) => {
        set((state) => ({ links: state.links.map((l) => (l.id === id ? { ...l, ...data } : l)) }))
        try {
          await supabase.from('payment_links').update({
            amount: data.amount,
            description: data.description,
            slug: data.slug,
            expiration: data.expiration,
            status: data.status,
          }).eq('id', id)
        } catch {}
      },

      deleteLink: async (id) => {
        set((state) => ({ links: state.links.filter((l) => l.id !== id) }))
        try {
          await supabase.from('payment_links').delete().eq('id', id)
        } catch {}
      },

      getLink: (id) => get().links.find((l) => l.id === id),
    }),
    { name: 'gopay-links' }
  )
)
