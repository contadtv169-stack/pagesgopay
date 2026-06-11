import { motion } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useNotificationsStore } from '../stores/notificationsStore'

interface Props {
  onClose: () => void
}

export function NotificationPermission({ onClose }: Props) {
  const addNotification = useNotificationsStore((s) => s.addNotification)

  const handleAllow = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('GoPay', { body: 'Notificações ativadas com sucesso!' })
        }
      })
    }
    addNotification({
      type: 'gateway_connected',
      title: 'Notificações ativadas',
      message: 'Você receberá alertas de pagamentos em tempo real',
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white w-full rounded-t-3xl p-6 pb-10"
        style={{ maxWidth: 393 }}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center">
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <div className="flex flex-col items-center -mt-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, -5, 0] }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-[#0066FF]/10 flex items-center justify-center"
          >
            <Bell size={36} color="#0066FF" />
          </motion.div>

          <h2 className="text-2xl font-bold text-[#1a1a2e] mt-4">Ativar Notificações</h2>
          <p className="text-[#6b7280] text-sm mt-1 text-center">
            Receba alertas de pagamentos em tempo real
          </p>

          <button
            onClick={handleAllow}
            className="btn-primary mt-6"
          >
            Permitir
          </button>

          <button
            onClick={onClose}
            className="w-full text-center text-sm font-medium text-[#6b7280] py-3 mt-2"
          >
            Agora não
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
