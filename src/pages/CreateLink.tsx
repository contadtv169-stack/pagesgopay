import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useLinksStore } from '../stores/linksStore'
import { useGatewayStore } from '../stores/gatewayStore'
import { useNotificationsStore } from '../stores/notificationsStore'

const KRYPT_BASE = 'https://kryptgateway.netlify.app'

export function CreateLink() {
  const navigate = useNavigate()
  const createLink = useLinksStore((s) => s.createLink)
  const { credentials, connectedGateway } = useGatewayStore()
  const addNotification = useNotificationsStore((s) => s.addNotification)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [expiration, setExpiration] = useState('never')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatCurrency = (val: string) => {
    const nums = val.replace(/\D/g, '')
    if (!nums) return ''
    const int = nums.slice(0, -2)
    const dec = nums.slice(-2).padStart(2, '0')
    const formatted = int ? parseInt(int).toLocaleString('pt-BR') : '0'
    return `${formatted},${dec}`
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nums = e.target.value.replace(/\D/g, '')
    if (!nums) { setAmount(''); return }
    const val = parseFloat(nums) / 100
    if (val > 999999) return
    setAmount(formatCurrency(nums))
  }

  const parseAmount = () => {
    const cleaned = amount.replace(/\./g, '').replace(',', '.')
    return parseFloat(cleaned) || 0
  }

  const generateSlug = () => {
    if (!slug && description) {
      return description.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30)
    }
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)
  }

  const handleSubmit = async () => {
    const val = parseAmount()
    if (!val || val <= 0) { setError('Informe um valor válido.'); return }
    setError('')
    setLoading(true)

    try {
      let transactionId: string | undefined
      let qrCodeBase64: string | undefined
      let copyPaste: string | undefined
      let paymentLink: string | undefined

      if (connectedGateway === 'krypt' && credentials) {
        const res = await fetch(`${KRYPT_BASE}/api/gateway/pix-create`, {
          method: 'POST',
          headers: {
            'ci': credentials.ci,
            'cs': credentials.cs,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: val,
            payerName: 'Link GoPay',
            payerDocument: '00000000000',
            description: description || 'Link de pagamento',
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            transactionId = data.data.transactionId
            qrCodeBase64 = data.data.qrCodeBase64
            copyPaste = data.data.copyPaste
            paymentLink = data.data.paymentLink
          }
        }
      }

      const finalSlug = generateSlug() || `link-${Date.now()}`
      const link = await createLink({
        amount: val,
        description: description || 'Link de pagamento',
        slug: finalSlug,
        expiration,
        transactionId,
        qrCodeBase64,
        copyPaste,
        paymentLink,
      })

      addNotification({
        type: 'link_created',
        title: 'Link criado',
        message: `Seu link '${finalSlug}' foi criado com sucesso`,
      })

      if (link) navigate(`/link-generated/${link.id}`)
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar link')
    }
    setLoading(false)
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
          <ArrowLeft size={20} color="#1a1a2e" />
        </button>
      </div>

      <div className="px-6 flex-1 overflow-y-auto">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-[#1a1a2e] mt-2">
          Novo Link
        </motion.h1>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#6b7280] mb-1 block">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-medium">R$</span>
              <input
                className="input-field pl-10 text-lg font-bold"
                placeholder="0,00"
                value={amount}
                onChange={handleAmountChange}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#6b7280] mb-1 block">Descrição / Nome do produto</label>
            <input
              className="input-field"
              placeholder="Ex: Consultoria de marketing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#6b7280] mb-1 block">URL personalizada</label>
            <div className="flex items-center bg-[#F5F7FA] rounded-[12px] px-4 h-[54px] border border-transparent focus-within:border-[#0066FF] focus-within:shadow-[0_0_0_3px_rgba(0,102,255,0.15)]">
              <span className="text-[#6b7280] text-sm shrink-0">pagesgopay/checkout/</span>
              <input
                className="flex-1 bg-transparent outline-none text-[16px] text-[#1a1a2e] ml-1"
                placeholder="consultoria"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#6b7280] mb-1 block">Expiração</label>
            <select
              className="input-field appearance-none"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
              }}
            >
              <option value="never">Não expira</option>
              <option value="1">1 dia</option>
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10">
        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={22} className="animate-spin" /> : 'Gerar Link'}
        </button>
      </div>
    </div>
  )
}
