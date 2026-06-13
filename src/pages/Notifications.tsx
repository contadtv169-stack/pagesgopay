import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Bell, CheckCheck, Trash2, BellOff, BellRing, DollarSign, Link2, Clock, Plug, ArrowDownCircle } from 'lucide-react'
import { useNotificationsStore } from '../stores/notificationsStore'
import type { Notification } from '../stores/notificationsStore'

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  payment:           { icon: <DollarSign size={18} />,    color: '#16a34a', bg: '#dcfce7' },
  link_created:      { icon: <Link2 size={18} />,         color: '#0066FF', bg: '#dbeafe' },
  link_expired:      { icon: <Clock size={18} />,         color: '#d97706', bg: '#fef3c7' },
  gateway_connected: { icon: <Plug size={18} />,          color: '#7c3aed', bg: '#ede9fe' },
  withdraw:          { icon: <ArrowDownCircle size={18} />, color: '#0891b2', bg: '#cffafe' },
}

function NotifIcon({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] || { icon: <Bell size={18} />, color: '#6b7280', bg: '#f3f4f6' }
  return (
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.icon}
    </div>
  )
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `Há ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Há ${days}d`
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount,
    pushEnabled,
    requestPushPermission,
  } = useNotificationsStore()

  const unread = unreadCount()

  const groups: { label: string; items: Notification[] }[] = []
  const today: Notification[] = []
  const yesterday: Notification[] = []
  const older: Notification[] = []

  const now = Date.now()
  for (const n of notifications) {
    const diff = now - new Date(n.timestamp).getTime()
    if (diff < 86400000) today.push(n)
    else if (diff < 172800000) yesterday.push(n)
    else older.push(n)
  }
  if (today.length)     groups.push({ label: 'Hoje', items: today })
  if (yesterday.length) groups.push({ label: 'Ontem', items: yesterday })
  if (older.length)     groups.push({ label: 'Anteriores', items: older })

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
              <ArrowLeft size={20} color="#1a1a2e" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#1a1a2e] leading-tight">Notificações</h1>
              {unread > 0 && (
                <p className="text-xs text-[#0066FF] font-medium">{unread} não lida{unread > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {unread > 0 && (
              <button
                onClick={() => markAllAsRead()}
                title="Marcar todas como lidas"
                className="w-9 h-9 rounded-full bg-[#F5F7FA] flex items-center justify-center"
              >
                <CheckCheck size={18} color="#0066FF" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => clearAll()}
                title="Limpar tudo"
                className="w-9 h-9 rounded-full bg-[#F5F7FA] flex items-center justify-center"
              >
                <Trash2 size={18} color="#ef4444" />
              </button>
            )}
          </div>
        </div>

        {/* Push toggle */}
        <button
          onClick={() => !pushEnabled && requestPushPermission()}
          className={`mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pushEnabled
              ? 'bg-green-50 border border-green-200'
              : 'bg-[#0066FF]/5 border border-[#0066FF]/20'
          }`}
        >
          {pushEnabled ? (
            <BellRing size={18} color="#16a34a" />
          ) : (
            <BellOff size={18} color="#0066FF" />
          )}
          <div className="flex-1 text-left">
            <p className={`text-sm font-semibold ${pushEnabled ? 'text-green-700' : 'text-[#0066FF]'}`}>
              {pushEnabled ? 'Push ativado' : 'Ativar notificações push'}
            </p>
            <p className="text-xs text-[#6b7280]">
              {pushEnabled
                ? 'Você receberá alertas mesmo com o app fechado'
                : 'Toque para receber alertas de pagamentos'}
            </p>
          </div>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
            pushEnabled ? 'bg-green-500 text-white' : 'bg-[#0066FF] text-white'
          }`}>
            {pushEnabled ? '✓' : '+'}
          </div>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-20 px-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell size={36} color="#d1d5db" strokeWidth={1.5} />
            </div>
            <p className="text-[#374151] font-semibold">Tudo limpo por aqui</p>
            <p className="text-[#9ca3af] text-sm mt-1">Suas notificações aparecem aqui assim que chegarem</p>
          </motion.div>
        ) : (
          <div className="px-4 pt-3 space-y-4">
            <AnimatePresence>
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-2 px-1">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => !n.read && markAsRead(n.id)}
                        className={`bg-white rounded-2xl p-4 flex items-start gap-3 cursor-pointer active:scale-[0.99] transition-transform shadow-sm ${
                          !n.read ? 'border-l-[3px] border-[#0066FF]' : ''
                        }`}
                      >
                        <NotifIcon type={n.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-snug ${n.read ? 'text-[#374151]' : 'font-semibold text-[#1a1a2e]'}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-[#9ca3af] shrink-0 mt-0.5">{formatTime(n.timestamp)}</span>
                          </div>
                          <p className="text-xs text-[#6b7280] mt-0.5 leading-relaxed">{n.message}</p>
                          {n.amount !== undefined && (
                            <p className="text-xs font-bold text-green-600 mt-1">
                              + R$ {n.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                        {!n.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF] shrink-0 mt-1" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
