import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, CheckCircle2, X, Shield } from 'lucide-react'
import { useGatewayStore, GATEWAY_CONFIGS } from '../stores/gatewayStore'
import { useNotificationsStore } from '../stores/notificationsStore'

export function ConnectGateway() {
  const navigate = useNavigate()
  const { connect, loading, connectedGateway, testConnection } = useGatewayStore()
  const addNotification = useNotificationsStore((s) => s.addNotification)
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const config = GATEWAY_CONFIGS.find((g) => g.type === selectedGateway)

  const handleConnect = async () => {
    if (!config) return
    const missing = config.fields.filter((f) => !fieldValues[f.key]?.trim())
    if (missing.length > 0) {
      setApiError(`Preencha todos os campos: ${missing.map((f) => f.label).join(', ')}`)
      return
    }
    setApiError('')

    const test = await testConnection(config.type as any, fieldValues)
    if (!test.ok) {
      setApiError(test.error || 'Erro ao conectar. Verifique suas credenciais.')
      return
    }

    const ok = await connect(config.type as any, { ...fieldValues })
    if (ok) {
      setSuccessMsg('Conta conectada com sucesso!')
      addNotification({ type: 'gateway_connected', title: 'Gateway conectado', message: `${config.name} conectado com sucesso!` })
      setTimeout(() => { setSelectedGateway(null); setSuccessMsg(''); setFieldValues({}) }, 1500)
    } else {
      setApiError(useGatewayStore.getState().error || 'Erro ao conectar')
    }
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
          <ArrowLeft size={20} color="#1a1a2e" />
        </button>
      </div>

      <div className="px-6 flex-1">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-[#1a1a2e] mt-2">
          Conectar Gateway
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[#6b7280] mt-1 text-sm">
          Conecte o GoPay ao seu provedor de pagamentos.
        </motion.p>

        <div className="mt-6 space-y-4">
          {GATEWAY_CONFIGS.map((g, i) => (
            <motion.div
              key={g.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => { setSelectedGateway(g.type); setApiError(''); setSuccessMsg(''); setFieldValues({}) }}
              className="card-white rounded-card p-5 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: g.logoBg }}>
                  <span className="text-xl font-bold" style={{ color: g.logoColor }}>{g.name[0]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1a1a2e]">{g.name}</h3>
                  <span className={`text-xs font-medium ${connectedGateway === g.type ? 'text-green-600' : 'text-orange-500'}`}>
                    {connectedGateway === g.type ? 'Conta conectada' : 'Conectar'}
                  </span>
                </div>
                {connectedGateway === g.type && <CheckCircle2 size={20} color="#16a34a" />}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-[#9ca3af] mt-6">Mais opções em breve!</p>

        <div className="mt-4 flex items-center gap-2 justify-center">
          <Shield size={14} color="#9ca3af" />
          <span className="text-xs text-[#9ca3af]">Suas credenciais ficam salvas com segurança.</span>
        </div>
      </div>

      <div className="px-6 pb-10">
        <button onClick={() => navigate('/dashboard')} disabled={!connectedGateway} className="btn-primary" style={{ opacity: !connectedGateway ? 0.5 : 1 }}>
          Ir para o painel
        </button>
      </div>

      <AnimatePresence>
        {selectedGateway && config && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1a1a2e]">Conectar {config.name}</h2>
                <button onClick={() => setSelectedGateway(null)} className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center">
                  <X size={18} color="#6b7280" />
                </button>
              </div>

              {successMsg ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center py-8">
                  <CheckCircle2 size={64} color="#16a34a" strokeWidth={1.5} />
                  <p className="text-green-600 font-semibold mt-4 text-lg">{successMsg}</p>
                </motion.div>
              ) : (
                <>
                  {apiError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{apiError}</div>
                  )}

                  <div className="space-y-4">
                    {config.fields.map((f) => (
                      <div key={f.key}>
                        <label className="text-sm font-medium text-[#6b7280] mb-1 block">{f.label}</label>
                        <input
                          className="input-field"
                          type={f.type}
                          placeholder={f.placeholder}
                          value={fieldValues[f.key] || ''}
                          onChange={(e) => setFieldValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-[#9ca3af] mt-3">Testaremos a conexão antes de salvar.</p>

                  <button onClick={handleConnect} disabled={loading} className="btn-primary mt-6">
                    {loading ? <Loader2 size={22} className="animate-spin" /> : 'Conectar'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
