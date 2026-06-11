import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Wallet, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useGatewayStore } from '../stores/gatewayStore'
import { useState } from 'react'

export function Withdraw() {
  const navigate = useNavigate()
  const { balance, connectedGateway } = useGatewayStore()
  const [showBalance, setShowBalance] = useState(true)

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const gatewayName = connectedGateway === 'krypt' ? 'KryptGateway' : 'AbacatePay'
  const gatewayUrl = connectedGateway === 'krypt'
    ? 'https://kryptgateway.netlify.app'
    : 'https://abacatepay.com'

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      <div className="px-4 pt-4 pb-2 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
            <ArrowLeft size={20} color="#1a1a2e" />
          </button>
          <h1 className="text-lg font-bold text-[#1a1a2e]">Saque</h1>
        </div>
      </div>

      <div className="flex-1 px-4 mt-3 overflow-y-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-card p-5 border-2 border-[#0066FF]/30"
          style={{ background: '#EFF6FF' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
              <Wallet size={20} color="#0066FF" />
            </div>
            <div>
              <p className="font-bold text-[#1a1a2e] text-sm">
                O saque é realizado diretamente no app do seu gateway.
              </p>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Você está conectado via {gatewayName}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-blue rounded-card p-5 text-white mt-4"
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
        </motion.div>

        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          href={gatewayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4 flex items-center justify-center gap-2 no-underline"
        >
          Ir para {gatewayName} <ExternalLink size={18} />
        </motion.a>

        <p className="text-center text-xs text-[#9ca3af] mt-4">
          O GoPay não realiza saques. Gerencie seu saldo no app conectado.
        </p>
      </div>
    </div>
  )
}
