import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Eye, Palette, Type, Image, Plus, X, Star, HelpCircle, Gift, Shield, Smartphone, Monitor, ExternalLink } from 'lucide-react'
import { useLinksStore, Review, FAQ } from '../stores/linksStore'

export function GoPayEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const link = useLinksStore((s) => s.links.find((l) => l.id === id))
  const updateLink = useLinksStore((s) => s.updateLink)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [bannerImage, setBannerImage] = useState('')
  const [bannerVideo, setBannerVideo] = useState('')
  const [logoImage, setLogoImage] = useState('')
  const [brandColor, setBrandColor] = useState('#0066FF')
  const [buttonText, setButtonText] = useState('')
  const [bonusText, setBonusText] = useState('')
  const [guaranteeText, setGuaranteeText] = useState('')
  const [thankYouMessage, setThankYouMessage] = useState('')
  const [thankYouVideo, setThankYouVideo] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownMinutes, setCountdownMinutes] = useState(30)
  const [reviews, setReviews] = useState<Review[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [trustBadges, setTrustBadges] = useState<string[]>([])
  const [tab, setTab] = useState<'content' | 'design' | 'social' | 'payment'>('content')
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')
  const [showPreview, setShowPreview] = useState(false)

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const thankYouVideoInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File, callback: (dataUrl: string) => void) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) callback(e.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (link) {
      setTitle(link.title || '')
      setSubtitle(link.subtitle || '')
      setBannerImage(link.bannerImage || '')
      setBannerVideo(link.bannerVideo || '')
      setLogoImage(link.logoImage || '')
      setBrandColor(link.brandColor || '#0066FF')
      setButtonText(link.buttonText || '')
      setBonusText(link.bonusText || '')
      setGuaranteeText(link.guaranteeText || '')
      setThankYouMessage(link.thankYouMessage || '')
      setThankYouVideo(link.thankYouVideo || '')
      setRedirectUrl(link.redirectUrl || '')
      setShowCountdown(link.showCountdown || false)
      setCountdownMinutes(link.countdownMinutes || 30)
      setReviews(link.reviews || [])
      setFaqs(link.faqs || [])
      setTrustBadges(link.trustBadges || [])
    }
  }, [link])

  if (!link) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <p className="text-[#6b7280]">Link não encontrado.</p>
      </div>
    )
  }

  const addReview = () => {
    setReviews([...reviews, { id: 'r_' + Date.now(), name: '', rating: 5, text: '', date: new Date().toISOString() }])
  }

  const updateReview = (id: string, field: keyof Review, value: any) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const removeReview = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id))
  }

  const addFaq = () => {
    setFaqs([...faqs, { id: 'f_' + Date.now(), question: '', answer: '' }])
  }

  const updateFaq = (id: string, field: keyof FAQ, value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id))
  }

  const addBadge = () => {
    setTrustBadges([...trustBadges, ''])
  }

  const updateBadge = (i: number, val: string) => {
    const next = [...trustBadges]
    next[i] = val
    setTrustBadges(next)
  }

  const removeBadge = (i: number) => {
    setTrustBadges(trustBadges.filter((_, idx) => idx !== i))
  }

  const handleSave = () => {
    updateLink(id!, {
      title,
      subtitle,
      bannerImage,
      bannerVideo,
      logoImage,
      brandColor,
      buttonText,
      bonusText,
      guaranteeText,
      thankYouMessage,
      thankYouVideo,
      redirectUrl,
      showCountdown,
      countdownMinutes,
      reviews,
      faqs,
      trustBadges,
    })
    navigate(`/link-details/${id}`)
  }

  const tabs = [
    { key: 'content', label: 'Conteúdo', icon: Type },
    { key: 'design', label: 'Design', icon: Palette },
    { key: 'social', label: 'Prova Social', icon: Star },
    { key: 'payment', label: 'Pagamento', icon: Eye },
  ] as const

  const inputClass = "input-field bg-[#F5F7FA]"
  const labelClass = "text-sm font-medium text-[#6b7280] mb-1 block"
  const sectionTitle = "text-sm font-bold text-[#1a1a2e] mt-5 mb-3 flex items-center gap-2"

  const previewContent = (
    <div className="min-h-screen bg-gray-50">
      <div className={previewMode === 'mobile' ? 'max-w-[480px] mx-auto px-4 py-6' : 'max-w-[1200px] mx-auto px-8 py-10'}>
        {bannerImage && (
          <div className="rounded-2xl overflow-hidden mb-4">
            <img src={bannerImage} alt="" className="w-full h-48 object-cover" />
          </div>
        )}
        <div className="text-center mb-6">
          {logoImage ? (
            <img src={logoImage} alt="" className="w-20 h-20 rounded-2xl mx-auto mb-3 object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: brandColor }}>
              <span className="text-4xl font-extrabold text-white">{title?.charAt(0) || 'G'}</span>
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-gray-900">{title || link.description}</h1>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Valor</p>
            <p className="text-5xl font-extrabold text-gray-900 mt-1">
              R$ {link.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          {bonusText && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-sm text-green-700 font-medium">{bonusText}</p>
            </div>
          )}
          {guaranteeText && (
            <div className="mt-3 flex items-center gap-2 justify-center text-sm text-gray-500">
              <Shield size={16} color="#16a34a" />
              <span>{guaranteeText}</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
          <h3 className="font-bold text-gray-900 mb-4">Seus dados</h3>
          <input className="w-full h-[50px] bg-gray-50 rounded-xl px-4 outline-none text-sm mb-3" placeholder="Nome completo" />
          <input className="w-full h-[50px] bg-gray-50 rounded-xl px-4 outline-none text-sm mb-4" placeholder="Email" />
          <button className="w-full h-[54px] rounded-[14px] text-white font-bold text-sm flex items-center justify-center" style={{ background: brandColor }}>
            {buttonText || 'Ir para pagamento'}
          </button>
        </div>
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
            <h3 className="font-bold text-gray-900 mb-4">Avaliações</h3>
            {reviews.filter(r => r.name && r.text).map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                <p className="text-sm font-medium text-gray-900">{r.name}</p>
                <div className="flex items-center gap-0.5 my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill={i < r.rating ? '#f59e0b' : '#d1d5db'} color={i < r.rating ? '#f59e0b' : '#d1d5db'} />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{r.text}</p>
              </div>
            ))}
          </div>
        )}
        {faqs.filter(f => f.question && f.answer).length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
            <h3 className="font-bold text-gray-900 mb-4">FAQ</h3>
            {faqs.filter(f => f.question && f.answer).map((f) => (
              <div key={f.id} className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                <p className="text-sm font-medium text-gray-800">{f.question}</p>
                <p className="text-sm text-gray-500 mt-1">{f.answer}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-gray-400 mt-6">GoPay - Receba. Conecte. Cresça.</p>
      </div>
    </div>
  )

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
            <ArrowLeft size={20} color="#1a1a2e" />
          </button>
          <h1 className="text-lg font-bold text-[#1a1a2e]">GoPay Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)} className={`w-10 h-10 rounded-full flex items-center justify-center ${showPreview ? 'bg-[#0066FF] text-white' : 'bg-[#F5F7FA] text-[#6b7280]'}`}>
            <Eye size={18} />
          </button>
          <button onClick={handleSave} className="w-10 h-10 rounded-full bg-[#0066FF] flex items-center justify-center">
            <Save size={18} color="white" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-100 bg-white">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              tab === t.key ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-[#6b7280]'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 px-4 py-2 bg-gray-50 border-b border-gray-100">
        <button onClick={() => setPreviewMode('mobile')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${previewMode === 'mobile' ? 'bg-white text-[#0066FF] shadow-sm' : 'text-[#6b7280]'}`}>
          <Smartphone size={14} /> Mobile
        </button>
        <button onClick={() => setPreviewMode('desktop')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${previewMode === 'desktop' ? 'bg-white text-[#0066FF] shadow-sm' : 'text-[#6b7280]'}`}>
          <Monitor size={14} /> Desktop
        </button>
        <div className="flex-1" />
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#0066FF]">
          <ExternalLink size={14} /> Ver página
        </a>
      </div>

      {showPreview ? (
        <div className={`flex-1 overflow-y-auto ${previewMode === 'mobile' ? 'flex justify-center py-4' : ''}`}>
          <div className={previewMode === 'mobile' ? 'w-[480px] rounded-3xl overflow-hidden shadow-xl border border-gray-200' : 'w-full'}>
            {previewContent}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {tab === 'content' && (
            <div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className={labelClass}>Título principal</label>
                  <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Curso Completo de Marketing" />
                </div>
                <div>
                  <label className={labelClass}>Subtítulo</label>
                  <input className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ex: Transforme sua carreira em 30 dias" />
                </div>
                <div>
                  <label className={labelClass}>Texto do botão</label>
                  <input className={inputClass} value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Ex: Comprar agora" />
                </div>
              </div>
              <p className={sectionTitle}><Gift size={16} /> Ofertas</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Texto de bônus</label>
                  <input className={inputClass} value={bonusText} onChange={(e) => setBonusText(e.target.value)} placeholder="Ex: 2 bônus exclusivos" />
                </div>
                <div>
                  <label className={labelClass}>Texto de garantia</label>
                  <input className={inputClass} value={guaranteeText} onChange={(e) => setGuaranteeText(e.target.value)} placeholder="Ex: 7 dias de garantia" />
                </div>
              </div>
              <p className={sectionTitle}><HelpCircle size={16} /> Pós-venda</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Mensagem de agradecimento</label>
                  <textarea className={`${inputClass} h-20 resize-none pt-3`} value={thankYouMessage} onChange={(e) => setThankYouMessage(e.target.value)} placeholder="Ex: Obrigado pela compra!" />
                </div>
                <div>
                  <label className={labelClass}>URL de redirecionamento</label>
                  <input className={inputClass} value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>
          )}

          {tab === 'design' && (
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>Imagem de banner</label>
                {bannerImage && (
                  <div className="mb-2 rounded-xl overflow-hidden h-32 bg-gray-100">
                    <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, setBannerImage) }} />
                  <button onClick={() => bannerInputRef.current?.click()} className="input-field text-left flex-1 text-[#6b7280]">
                    <Image size={16} className="mr-2 inline" /> Escolher imagem
                  </button>
                  <input className={inputClass} value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} placeholder="ou URL..." />
                </div>
              </div>
              <div>
                <label className={labelClass}>Vídeo de banner (URL)</label>
                <input className={inputClass} value={bannerVideo} onChange={(e) => setBannerVideo(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className={labelClass}>Logo</label>
                <div className="flex items-center gap-3 mb-2">
                  {logoImage && (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => logoInputRef.current?.click()} className="input-field text-left flex-1 text-[#6b7280]">
                    <Image size={16} className="mr-2 inline" /> Escolher logo
                  </button>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, setLogoImage) }} />
                  <input className={inputClass} value={logoImage} onChange={(e) => setLogoImage(e.target.value)} placeholder="ou URL..." />
                </div>
              </div>
              <div>
                <label className={labelClass}>Cor da marca</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
                  <input className={inputClass} value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="#0066FF" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="countdown" checked={showCountdown} onChange={(e) => setShowCountdown(e.target.checked)} className="w-5 h-5 rounded accent-[#0066FF]" />
                <label htmlFor="countdown" className="text-sm text-[#4b5563]">Mostrar contagem regressiva</label>
              </div>
              {showCountdown && (
                <div>
                  <label className={labelClass}>Minutos para expiração</label>
                  <input type="number" className={inputClass} value={countdownMinutes} onChange={(e) => setCountdownMinutes(Number(e.target.value))} min={1} max={1440} />
                </div>
              )}
            </div>
          )}

          {tab === 'social' && (
            <div className="mt-4">
              <p className={sectionTitle}><Star size={16} /> Avaliações</p>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-[#F5F7FA] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <input className="input-field bg-white flex-1 mr-2" value={review.name} onChange={(e) => updateReview(review.id, 'name', e.target.value)} placeholder="Nome do cliente" />
                      <button onClick={() => removeReview(review.id)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                        <X size={14} color="#ef4444" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => updateReview(review.id, 'rating', s)}>
                          <Star size={16} fill={s <= review.rating ? '#f59e0b' : '#d1d5db'} color={s <= review.rating ? '#f59e0b' : '#d1d5db'} />
                        </button>
                      ))}
                    </div>
                    <textarea className="input-field bg-white h-16 resize-none pt-3" value={review.text} onChange={(e) => updateReview(review.id, 'text', e.target.value)} placeholder="Texto do depoimento..." />
                  </div>
                ))}
                <button onClick={addReview} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-[#6b7280] flex items-center justify-center gap-2">
                  <Plus size={16} /> Adicionar avaliação
                </button>
              </div>

              <p className={sectionTitle}><HelpCircle size={16} /> FAQ</p>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-[#F5F7FA] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <input className="input-field bg-white flex-1 mr-2" value={faq.question} onChange={(e) => updateFaq(faq.id, 'question', e.target.value)} placeholder="Pergunta" />
                      <button onClick={() => removeFaq(faq.id)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                        <X size={14} color="#ef4444" />
                      </button>
                    </div>
                    <textarea className="input-field bg-white h-16 resize-none pt-3" value={faq.answer} onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)} placeholder="Resposta..." />
                  </div>
                ))}
                <button onClick={addFaq} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-[#6b7280] flex items-center justify-center gap-2">
                  <Plus size={16} /> Adicionar pergunta
                </button>
              </div>

              <p className={sectionTitle}><Shield size={16} /> Selos de confiança</p>
              <div className="space-y-3">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className={inputClass} value={badge} onChange={(e) => updateBadge(i, e.target.value)} placeholder="Ex: Pagamento 100% Seguro" />
                    <button onClick={() => removeBadge(i)} className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center shrink-0">
                      <X size={14} color="#ef4444" />
                    </button>
                  </div>
                ))}
                <button onClick={addBadge} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-[#6b7280] flex items-center justify-center gap-2">
                  <Plus size={16} /> Adicionar selo
                </button>
              </div>
            </div>
          )}

          {tab === 'payment' && (
            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">Configurações de pagamento</p>
                <p className="text-blue-600">As configurações de gateway são gerenciadas em Conectar Gateway.</p>
              </div>
              <div>
                <label className={labelClass}>Vídeo de agradecimento</label>
                <div className="flex gap-2">
                  <button onClick={() => thankYouVideoInputRef.current?.click()} className="input-field text-left flex-1 text-[#6b7280]">
                    <Image size={16} className="mr-2 inline" /> Escolher vídeo
                  </button>
                  <input ref={thankYouVideoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, setThankYouVideo) }} />
                  <input className={inputClass} value={thankYouVideo} onChange={(e) => setThankYouVideo(e.target.value)} placeholder="ou URL..." />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <button onClick={handleSave} className="btn-primary">
          <Save size={18} className="mr-2" /> Salvar personalização
        </button>
      </div>
    </div>
  )
}
