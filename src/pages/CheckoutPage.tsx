import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, CheckCircle2, Clock, DollarSign, Loader2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState, useEffect } from 'react'
import { useLinksStore } from '../stores/linksStore'

export function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const links = useLinksStore((s) => s.links)
  const updateLink = useLinksStore((s) => s.updateLink)
  const [link, setLink] = useState(useLinksStore.getState().links.find((l) => l.slug === slug))
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending')

  useEffect(() => {
    const found = links.find((l) => l.slug === slug)
    if (found) {
      setLink(found)
      if (found.payments > 0) setPaymentStatus('paid')
    }

    if (found?.transactionId && found.gatewayType === 'krypt') {
      const interval = setInterval(async () => {
        try {
          const { useGatewayStore } = await import('../stores/gatewayStore')
          const { credentials } = useGatewayStore.getState()
          if (credentials?.ci && credentials?.cs) {
            const res = await fetch(`https://kryptgateway.netlify.app/api/gateway/pix-status?transactionId=${found.transactionId}`, {
              headers: { 'ci': credentials.ci, 'cs': credentials.cs, 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            if (data?.success && data.data?.status === 'paid') {
              setPaymentStatus('paid')
              updateLink(found.id, { payments: found.payments + 1, views: found.views + 1 })
              clearInterval(interval)
            }
          }
        } catch {}
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [slug, links])

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleCopy = () => {
    if (link?.copyPaste) {
      navigator.clipboard.writeText(link.copyPaste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!link) {
    return (
      <div className="min-h-screen w-full bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Link não encontrado</h1>
          <p className="text-[#6b7280] mt-2">Este link de pagamento não existe ou expirou.</p>
        </div>
      </div>
    )
  }

  if (link.status === 'expired') {
    return (
      <div className="min-h-screen w-full bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <Clock size={48} color="#9ca3af" className="mx-auto" />
          <h1 className="text-2xl font-bold text-[#1a1a2e] mt-4">Link Expirado</h1>
          <p className="text-[#6b7280] mt-2">Este link de pagamento expirou.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]">
      <div className="max-w-[420px] mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#0066FF' }}>
            <span className="text-3xl font-extrabold text-white">G</span>
          </div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">GoPay</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">{link.description}</h2>
            {paymentStatus === 'paid' && (
              <span className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">Pago</span>
            )}
          </div>

          <div className="text-center py-4 border-y border-[#F5F7FA]">
            <p className="text-sm text-[#6b7280]">Valor a pagar</p>
            <p className="text-4xl font-extrabold text-[#1a1a2e] mt-1">{formatCurrency(link.amount)}</p>
          </div>

          {paymentStatus === 'paid' ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
              <CheckCircle2 size={72} color="#16a34a" className="mx-auto" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-green-700 mt-4">Pagamento Confirmado!</h3>
              <p className="text-sm text-[#6b7280] mt-1">Obrigado pelo seu pagamento.</p>
            </motion.div>
          ) : (
            <>
              {link.qrCodeBase64 ? (
                <div className="flex justify-center my-6">
                  <img src={link.qrCodeBase64} alt="QR Code PIX" className="w-52 h-52" />
                </div>
              ) : (
                <div className="flex justify-center my-6">
                  <QRCodeSVG value={link.url} size={200} level="M" />
                </div>
              )}

              {link.copyPaste && (
                <div className="mt-4 bg-[#F5F7FA] rounded-xl p-4">
                  <p className="text-xs text-[#6b7280] font-medium mb-2">Código PIX Copia e Cola</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#1a1a2e] break-all flex-1">{link.copyPaste}</p>
                    <button onClick={handleCopy} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <Copy size={14} color={copied ? '#16a34a' : '#0066FF'} />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-600 mt-1">Copiado!</p>}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 justify-center text-xs text-[#9ca3af]">
                <Loader2 size={12} className="animate-spin" />
                <span>Aguardando pagamento...</span>
              </div>
            </>
          )}
        </motion.div>

        <p className="text-center text-xs text-[#9ca3af] mt-6">GoPay - Receba. Conecte. Cresça.</p>
      </div>
    </div>
  )
}
