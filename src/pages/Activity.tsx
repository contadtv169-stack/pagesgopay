import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, XCircle, BarChart3, DollarSign } from 'lucide-react'
import { useLinksStore } from '../stores/linksStore'

const periods = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Tudo', value: 'all' },
]

export function Activity() {
  const navigate = useNavigate()
  const links = useLinksStore((s) => s.links)
  const [period, setPeriod] = useState('all')

  const transactions = links.flatMap((link) => {
    const items: { id: string; description: string; amount: number; status: string; date: string }[] = []
    if (link.payments > 0) {
      for (let i = 0; i < link.payments; i++) {
        items.push({
          id: `${link.id}-${i}`,
          description: link.description,
          amount: link.amount,
          status: 'paid',
          date: link.createdAt,
        })
      }
    }
    if (items.length === 0) {
      items.push({
        id: link.id,
        description: link.description,
        amount: link.amount,
        status: 'pending',
        date: link.createdAt,
      })
    }
    return items
  })

  const filtered = transactions.filter((t) => {
    if (period === 'all') return true
    const days = period === 'today' ? 0 : period === '7d' ? 7 : 30
    const d = new Date()
    d.setDate(d.getDate() - days)
    return new Date(t.date) >= d
  })

  const total = filtered.reduce((sum, t) => sum + (t.status === 'paid' ? t.amount : 0), 0)

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  type TxStatus = 'paid' | 'pending' | 'expired'
  const statusConfig: Record<TxStatus, { icon: any; color: string; bg: string; label: string }> = {
    paid: { icon: CheckCircle2, color: '#16a34a', bg: 'bg-green-50', label: 'Pago' },
    pending: { icon: Clock, color: '#d97706', bg: 'bg-yellow-50', label: 'Pendente' },
    expired: { icon: XCircle, color: '#9ca3af', bg: 'bg-gray-50', label: 'Expirado' },
  }

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      <div className="px-4 pt-4 pb-2 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
            <ArrowLeft size={20} color="#1a1a2e" />
          </button>
          <h1 className="text-lg font-bold text-[#1a1a2e]">Atividade</h1>
        </div>

        <div className="flex gap-2 mt-3">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-[10px] text-xs font-medium transition-colors ${
                period === p.value ? 'bg-[#0066FF] text-white' : 'bg-[#F5F7FA] text-[#6b7280]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-white rounded-card p-4 mb-3">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} color="#0066FF" />
            <div>
              <p className="text-xs text-[#6b7280]">Total do período</p>
              <p className="text-xl font-bold text-[#1a1a2e]">{formatCurrency(total)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16">
            <BarChart3 size={48} color="#d1d5db" strokeWidth={1} />
            <p className="text-[#9ca3af] mt-4 text-sm">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t, i) => {
              const cfg = statusConfig[t.status as TxStatus]
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-white rounded-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center`}>
                      <cfg.icon size={18} color={cfg.color} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a2e]">{t.description}</p>
                      <p className="text-xs text-[#9ca3af]">{formatDateTime(t.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.status === 'paid' ? 'text-green-600' : t.status === 'pending' ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {formatCurrency(t.amount)}
                    </p>
                    <p className="text-[10px] text-[#9ca3af]">{cfg.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
