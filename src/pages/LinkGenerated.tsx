import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Share2, ArrowLeft, ExternalLink, Palette } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useLinksStore } from '../stores/linksStore'

export function LinkGenerated() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const link = useLinksStore((s) => s.links.find((l) => l.id === id))
  const [copied, setCopied] = useState(false)

  if (!link) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <p className="text-[#6b7280]">Link não encontrado.</p>
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'GoPay', text: `Pague-me via GoPay: ${link.url}`, url: link.url })
      } catch {}
    } else {
      handleCopy()
    }
  }

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
          <ArrowLeft size={20} color="#1a1a2e" />
        </button>
      </div>

      <div className="flex-1 px-6 flex flex-col items-center justify-center -mt-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 size={80} color="#16a34a" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-[#1a1a2e] mt-5 text-center"
        >
          Link gerado com sucesso!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[#6b7280] text-sm mt-1"
        >
          Compartilhe seu link para receber pagamentos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-6 bg-[#F5F7FA] rounded-card p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#1a1a2e] truncate flex-1 mr-2">{link.url}</p>
            <button
              onClick={handleCopy}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 card-white"
            >
              <Copy size={16} color={copied ? '#16a34a' : '#0066FF'} />
            </button>
          </div>
          {copied && <p className="text-xs text-green-600 mt-1">Link copiado!</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white rounded-card p-4 card-white"
        >
          <QRCodeSVG value={link.url} size={180} level="M" />
        </motion.div>

        {link.copyPaste && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full mt-4 bg-[#F5F7FA] rounded-card p-3"
          >
            <p className="text-xs text-[#6b7280] font-medium mb-1">Código PIX Copia e Cola</p>
            <p className="text-xs text-[#1a1a2e] break-all">{link.copyPaste}</p>
          </motion.div>
        )}
      </div>

      <div className="px-6 pb-10 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className="btn-primary"
        >
          <Share2 size={18} className="mr-2" /> Compartilhar
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/link-details/${link.id}`)}
          className="btn-secondary"
        >
          <ExternalLink size={18} className="mr-2" /> Ver detalhes
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/gopay-editor/${link.id}`)}
          className="btn-secondary"
        >
          <Palette size={18} className="mr-2" /> Personalizar página (GoPay Editor)
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/create-link')}
          className="w-full text-center text-sm font-medium text-[#0066FF] py-2"
        >
          Criar outro link
        </motion.button>
      </div>
    </div>
  )
}
