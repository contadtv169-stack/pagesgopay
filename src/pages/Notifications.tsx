import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useNotificationsStore } from '../stores/notificationsStore'

export function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, markAllAsRead, clearAll } = useNotificationsStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💚'
      case 'link_created': return '🔵'
      case 'link_expired': return '🟡'
      case 'gateway_connected': return '🟢'
      default: return '🔔'
    }
  }

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Agora'
    if (mins < 60) return `Há ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Há ${hours}h`
    const days = Math.floor(hours / 24)
    return `Há ${days}d`
  }

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      <div className="px-4 pt-4 pb-2 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
              <ArrowLeft size={20} color="#1a1a2e" />
            </button>
            <h1 className="text-lg font-bold text-[#1a1a2e]">Notificações</h1>
          </div>
          <div className="flex gap-1">
            <button onClick={markAllAsRead} className="w-9 h-9 rounded-full bg-[#F5F7FA] flex items-center justify-center">
              <CheckCheck size={18} color="#0066FF" />
            </button>
            <button onClick={clearAll} className="w-9 h-9 rounded-full bg-[#F5F7FA] flex items-center justify-center">
              <Trash2 size={18} color="#ef4444" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 mt-3 overflow-y-auto pb-24">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16">
            <Bell size={48} color="#d1d5db" strokeWidth={1} />
            <p className="text-[#9ca3af] mt-4 text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card-white rounded-card p-4 flex items-start gap-3 ${
                  !n.read ? 'border-l-[3px] border-[#0066FF]' : ''
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{getIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e]">{n.title}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-[#9ca3af] mt-1">{formatTime(n.timestamp)}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-[#0066FF] shrink-0 mt-1.5" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
