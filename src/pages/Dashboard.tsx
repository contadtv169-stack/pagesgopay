import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Eye, EyeOff, Plus, Link, BarChart3, Settings, ArrowUpRight, Wallet, AlertTriangle, Medal } from 'lucide-react'
import { useGatewayStore } from '../stores/gatewayStore'
import { useAuthStore } from '../stores/authStore'
import { useNotificationsStore } from '../stores/notificationsStore'
import { useLinksStore } from '../stores/linksStore'

const quickActions = [
  { icon: Plus, label: 'Novo Link', path: '/create-link', color: '#0066FF' },
  { icon: Link, label: 'Links', path: '/links', color: '#7c3aed' },
  { icon: BarChart3, label: 'Extrato', path: '/activity', color: '#059669' },
  { icon: Settings, label: 'Config', path: '/profile', color: '#d97706' },
]

export function Dashboard() {
  const navigate = useNavigate()
  const { connectedGateway, balance, fetchBalance } = useGatewayStore()
  const user = useAuthStore((s) => s.user)
  const unreadCount = useNotificationsStore((s) => s.unreadCount())
  const [showBalance, setShowBalance] = useState(true)
  const links = useLinksStore((s) => s.links)

  useEffect(() => {
    if (connectedGateway) {
      fetchBalance()
    }
  }, [connectedGateway])

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const allTransactions = links
    .filter((l) => l.transactions && l.transactions.length > 0)
    .flatMap((l) => (l.transactions || []).map((t) => ({ ...t, linkSlug: l.slug })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  if (!connectedGateway) {
    return (
      <div className="h-full w-full bg-[#F5F7FA] flex flex-col p-4">
        <div className="flex items-center justify-between pt-2 pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋</h1>
          </div>
          <button onClick={() => navigate('/notifications')} className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center card-white">
            <Bell size={20} color="#1a1a2e" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-blue rounded-card p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} color="rgba(255,255,255,0.8)" />
            <div>
              <p className="font-semibold text-sm">Conecte um gateway</p>
              <p className="text-white/70 text-xs mt-0.5">para começar a receber pagamentos</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/connect-gateway')}
            className="bg-white/20 text-white font-semibold rounded-[14px] h-[46px] w-full flex items-center justify-center gap-2"
          >
            Conectar agora <ArrowUpRight size={18} />
          </button>
        </motion.div>
      </div>
    )
  }

  const metrics = [
    { label: 'Recebimentos hoje', value: formatCurrency(balance?.todayReceived || 0), color: '#059669' },
    { label: 'Recebimentos do mês', value: formatCurrency(balance?.monthReceived || 0), color: '#0066FF' },
    { label: 'Total de links', value: String(balance?.totalLinks || 0), color: '#7c3aed' },
    { label: 'Total de pagamentos', value: String(balance?.totalPayments || 0), color: '#d97706' },
  ]

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a2e]">Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋</h1>
          </div>
          <button onClick={() => navigate('/notifications')} className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center card-white">
            <Bell size={20} color="#1a1a2e" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-blue rounded-card p-5 text-white mt-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Saldo disponível</p>
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <Eye size={18} color="rgba(255,255,255,0.7)" /> : <EyeOff size={18} color="rgba(255,255,255,0.7)" />}
            </button>
          </div>
          <p className="text-3xl font-extrabold mt-2 tracking-tight">
            {showBalance ? formatCurrency(balance?.availableBalance || 0) : 'R$ ••••••'}
          </p>
          <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
            <Wallet size={12} /> via KryptGateway
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="card-white rounded-card p-4"
            >
              <p className="text-xs text-[#6b7280] font-medium">{m.label}</p>
              <p className="text-lg font-bold mt-1" style={{ color: m.color }}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Ações rápidas</h2>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <motion.button
                key={a.label}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(a.path)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center"
                  style={{ background: `${a.color}15` }}
                >
                  <a.icon size={22} color={a.color} />
                </div>
                <span className="text-[10px] font-medium text-[#6b7280]">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider">Atividade recente</h2>
              <button onClick={() => navigate('/activity')} className="text-xs font-medium text-[#0066FF]">Ver todas</button>
            </div>

            <div className="space-y-2">
              {allTransactions.length === 0 ? (
                <div className="card-white rounded-card p-6 text-center">
                  <p className="text-sm text-[#9ca3af]">Nenhuma transação ainda</p>
                  <button onClick={() => navigate('/create-link')} className="text-xs font-medium text-[#0066FF] mt-2">
                    Criar primeiro link
                  </button>
                </div>
              ) : (
                allTransactions.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="card-white rounded-card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                        <ArrowUpRight size={18} color="#16a34a" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1a2e]">{item.customerName}</p>
                        <p className="text-xs text-[#9ca3af]">{new Date(item.date).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(item.amount)}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <button onClick={() => navigate('/badges')} className="w-full mt-4 card-white rounded-card p-4 flex items-center gap-3">
            <Medal size={20} color="#d97706" />
            <span className="text-sm font-medium text-[#1a1a2e]">Ver Placas Digitais</span>
          </button>
      </div>
    </div>
  )
}
