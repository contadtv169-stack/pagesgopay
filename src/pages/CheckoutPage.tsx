import { useParams } from 'react-router-dom'
import { useNotificationsStore } from '../stores/notificationsStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, CheckCircle2, Clock, Loader2, Star, Shield, ChevronDown, ArrowRight, User, Mail, Lock, ExternalLink } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState, useEffect } from 'react'
import { useLinksStore, Transaction } from '../stores/linksStore'

const COUNTDOWN_MINUTES = 30

export function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>()
  const links = useLinksStore((s) => s.links)
  const updateLink = useLinksStore((s) => s.updateLink)
  const [link, setLink] = useState(useLinksStore.getState().links.find((l) => l.slug === slug))
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_MINUTES * 60)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const isBrandColor = link?.brandColor || '#0066FF'

  useEffect(() => {
    const found = links.find((l) => l.slug === slug)
    if (found) {
      setLink(found)
      if (found.payments > 0) setPaymentStatus('paid')
    }

    // Krypt gateway polling
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
              handlePaymentConfirmed(found, 'krypt')
              clearInterval(interval)
            }
          }
        } catch {}
      }, 5000)
      return () => clearInterval(interval)
    }

    // AbacatePay polling
    if (found?.transactionId && found.gatewayType === 'abacate') {
      const interval = setInterval(async () => {
        try {
          const { useGatewayStore } = await import('../stores/gatewayStore')
          const { credentials } = useGatewayStore.getState()
          if (credentials?.apiKey && credentials?.baseUrl) {
            const res = await fetch(`${credentials.baseUrl}/api/v1/billing/${found.transactionId}`, {
              headers: { 'Authorization': `Bearer ${credentials.apiKey}`, 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            if (data?.data?.status === 'PAID' || data?.status === 'PAID') {
              handlePaymentConfirmed(found, 'abacate')
              clearInterval(interval)
            }
          }
        } catch {}
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [slug, links])

  const handlePaymentConfirmed = (found: typeof link, gateway: string) => {
    setPaymentStatus('paid')
    // Fire notification
    useNotificationsStore.getState().addNotification({
      type: 'payment',
      title: 'Pagamento confirmado! 💰',
      message: `Recebido: ${found!.title || found!.description}`,
      amount: found!.amount,
    })
    const tx: Transaction = {
      id: 'tx_' + Date.now(),
      customerName: customerName || 'Cliente',
      customerEmail: customerEmail || 'cliente@email.com',
      amount: found!.amount,
      status: 'paid',
      date: new Date().toISOString(),
      paymentMethod: 'PIX',
      transactionId: found!.transactionId,
    }
    const existing = found!.transactions || []
    updateLink(found!.id, { payments: found!.payments + 1, transactions: [...existing, tx] })

    // Auto-redirect after payment if configured
    if (found?.redirectUrl) {
      setTimeout(() => {
        window.location.href = found.redirectUrl!
      }, 3000)
    }
  }

  useEffect(() => {
    if (!showPayment) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [showPayment])

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleCopy = () => {
    if (link?.copyPaste) {
      navigator.clipboard.writeText(link.copyPaste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStart = () => {
    if (customerName.trim() && customerEmail.trim()) {
      setShowPayment(true)
      updateLink(link!.id, { views: (link?.views || 0) + 1 })
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Clock size={48} className="mx-auto text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Link não encontrado</h1>
          <p className="text-gray-500 mt-2">Este link de pagamento não existe ou expirou.</p>
        </div>
      </div>
    )
  }

  if (link.status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Clock size={48} className="mx-auto text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Link Expirado</h1>
          <p className="text-gray-500 mt-2">Este link de pagamento expirou.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[480px] mx-auto px-4 py-6">
        {/* Countdown */}
        {showPayment && paymentStatus === 'pending' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-4 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
            <Clock size={16} />
            <span>Tempo restante: <strong>{formatTime(countdown)}</strong></span>
          </motion.div>
        )}

        {/* Banner */}
        {link.bannerImage && (
          <div className="rounded-2xl overflow-hidden mb-4">
            <img src={link.bannerImage} alt="" className="w-full h-48 object-cover" />
          </div>
        )}

        {/* Logo + Brand */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          {link.logoImage ? (
            <img src={link.logoImage} alt="" className="w-20 h-20 rounded-2xl mx-auto mb-3 object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: isBrandColor }}>
              <span className="text-4xl font-extrabold text-white">{link.title?.charAt(0) || 'G'}</span>
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-gray-900">{link.title || link.description}</h1>
          {link.subtitle && <p className="text-gray-500 text-sm mt-1">{link.subtitle}</p>}
        </motion.div>

        <AnimatePresence mode="wait">
          {paymentStatus === 'paid' ? (
            <motion.div key="paid" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <CheckCircle2 size={80} color="#16a34a" className="mx-auto" strokeWidth={1.5} />
              <h2 className="text-2xl font-bold text-green-700 mt-4">Pagamento Confirmado!</h2>
              <p className="text-gray-500 mt-2">Obrigado{`${customerName ? ', ' + customerName.split(' ')[0] : ''}`}!</p>
              {link.thankYouMessage && <p className="text-gray-600 mt-4">{link.thankYouMessage}</p>}
              {link.thankYouVideo && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <video src={link.thankYouVideo} controls className="w-full" />
                </div>
              )}
              {link.redirectUrl && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-3">Você será redirecionado automaticamente...</p>
                  <a
                    href={link.redirectUrl}
                    className="btn-primary mt-2 inline-flex items-center gap-2"
                    style={{ background: isBrandColor, boxShadow: `0 4px 15px ${isBrandColor}40` }}
                  >
                    <ExternalLink size={16} />
                    Continuar <ArrowRight size={18} className="ml-1" />
                  </a>
                </div>
              )}
            </motion.div>
          ) : !showPayment ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Pricing */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="text-5xl font-extrabold text-gray-900 mt-1">{formatCurrency(link.amount)}</p>
                </div>

                {link.bonusText && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-green-700 font-medium">🎁 {link.bonusText}</p>
                  </div>
                )}

                {link.guaranteeText && (
                  <div className="mt-3 flex items-center gap-2 justify-center text-sm text-gray-500">
                    <Shield size={16} color="#16a34a" />
                    <span>{link.guaranteeText}</span>
                  </div>
                )}
              </div>

              {/* Customer Form */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                <h3 className="font-bold text-gray-900 mb-4">Seus dados</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4">
                    <User size={18} color="#9ca3af" />
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="flex-1 h-[50px] bg-transparent outline-none text-sm text-gray-900"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4">
                    <Mail size={18} color="#9ca3af" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="flex-1 h-[50px] bg-transparent outline-none text-sm text-gray-900"
                    />
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  disabled={!customerName.trim() || !customerEmail.trim()}
                  className="btn-primary mt-4"
                  style={{ background: isBrandColor, boxShadow: `0 4px 15px ${isBrandColor}40` }}
                >
                  {link.buttonText || 'Ir para pagamento'} <ArrowRight size={18} className="ml-2" />
                </button>

                <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400">
                  <Lock size={12} />
                  <span>Pagamento 100% seguro via PIX</span>
                </div>
              </div>

              {/* Reviews */}
              {link.reviews && link.reviews.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                  <h3 className="font-bold text-gray-900 mb-4">O que dizem por aí</h3>
                  <div className="space-y-4">
                    {link.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{review.name}</p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? '#f59e0b' : '#d1d5db'} color={i < review.rating ? '#f59e0b' : '#d1d5db'} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {link.faqs && link.faqs.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                  <h3 className="font-bold text-gray-900 mb-4">Perguntas Frequentes</h3>
                  <div className="space-y-2">
                    {link.faqs.map((faq) => (
                      <div key={faq.id}>
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between py-3 text-left text-sm font-medium text-gray-800"
                        >
                          {faq.question}
                          <ChevronDown size={16} className={`transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {expandedFaq === faq.id && (
                            <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-sm text-gray-500 pb-3">
                              {faq.answer}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              {link.trustBadges && link.trustBadges.length > 0 && (
                <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
                  {link.trustBadges.map((badge, i) => (
                    <span key={i} className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm">{badge}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Payment Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isBrandColor }}>
                    <span className="text-lg font-extrabold text-white">{link.title?.charAt(0) || 'G'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(link.amount)}</p>
                    <p className="text-xs text-gray-500">Pix</p>
                  </div>
                </div>

                <div className="flex justify-center my-6">
                  {link.qrCodeBase64 ? (
                    <img src={link.qrCodeBase64} alt="QR Code PIX" className="w-52 h-52" />
                  ) : (
                    <QRCodeSVG value={link.paymentLink || link.url} size={200} level="M" />
                  )}
                </div>

                {link.copyPaste && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium mb-2">Código PIX Copia e Cola</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-800 break-all flex-1">{link.copyPaste}</p>
                      <button onClick={handleCopy} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                        <Copy size={14} color={copied ? '#16a34a' : isBrandColor} />
                      </button>
                    </div>
                    {copied && <p className="text-xs text-green-600 mt-1">Copiado!</p>}
                  </div>
                )}

                {/* AbacatePay direct link */}
                {link.gatewayType === 'abacate' && link.paymentLink && (
                  <a
                    href={link.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-4 flex items-center justify-center gap-2"
                    style={{ background: '#16a34a', boxShadow: '0 4px 15px #16a34a40' }}
                  >
                    <ExternalLink size={16} />
                    Pagar via AbacatePay
                  </a>
                )}

                <div className="mt-4 flex items-center gap-2 justify-center text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Aguardando pagamento...</span>
                </div>
              </div>

              {/* Customer info confirmation */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500">
                  Pagando como <strong className="text-gray-700">{customerName}</strong> • {customerEmail}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-gray-400 mt-6">GoPay - Receba. Conecte. Cresça.</p>
      </div>
    </div>
  )
}
