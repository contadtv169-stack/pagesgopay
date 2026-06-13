import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, BellOff, BellRing } from 'lucide-react'
import { useNotificationsStore } from '../stores/notificationsStore'

interface Props {
  onClose: () => void
}

export function NotificationPermission({ onClose }: Props) {
  const { requestPushPermission } = useNotificationsStore()

  const handleAllow = async () => {
    await requestPushPermission()
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
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-[#0066FF]/10 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <BellRing size={38} color="#0066FF" />
            </motion.div>
          </motion.div>

          <h2 className="text-2xl font-bold text-[#1a1a2e] mt-4">Ativar Notificações</h2>
          <p className="text-[#6b7280] text-sm mt-2 text-center leading-relaxed">
            Receba alertas em tempo real quando um pagamento for confirmado
          </p>

          <div className="w-full mt-5 space-y-2.5">
            {[
              { icon: '💰', text: 'Pagamentos confirmados na hora' },
              { icon: '🔗', text: 'Links criados e expirados' },
              { icon: '⚡', text: 'Alertas do gateway em tempo real' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 bg-[#F5F7FA] rounded-xl px-4 py-3"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm text-[#374151] font-medium">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <button
            onClick={handleAllow}
            className="btn-primary mt-6 flex items-center gap-2"
          >
            <Bell size={18} />
            Ativar notificações
          </button>

          <button
            onClick={onClose}
            className="w-full text-center text-sm font-medium text-[#9ca3af] py-3 mt-1 flex items-center justify-center gap-1"
          >
            <BellOff size={14} />
            Agora não
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
