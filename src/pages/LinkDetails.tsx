import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Edit3, ExternalLink, DollarSign, Calendar, Eye, BarChart3 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useLinksStore } from '../stores/linksStore'
import { useState } from 'react'

export function LinkDetails() {
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

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      <div className="px-4 pt-4 pb-2 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
            <ArrowLeft size={20} color="#1a1a2e" />
          </button>
          <h1 className="text-lg font-bold text-[#1a1a2e]">Informações do Link</h1>
        </div>
        <button onClick={() => navigate(`/edit-link/${link.id}`)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
          <Edit3 size={18} color="#0066FF" />
        </button>
      </div>

      <div className="flex-1 px-4 mt-3 overflow-y-auto pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-white rounded-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[#1a1a2e] truncate flex-1 mr-2">{link.url}</p>
            <button onClick={handleCopy} className="w-9 h-9 rounded-full bg-[#F5F7FA] flex items-center justify-center shrink-0">
              <Copy size={16} color={copied ? '#16a34a' : '#0066FF'} />
            </button>
          </div>
          {copied && <p className="text-xs text-green-600 mb-2">Link copiado!</p>}

          <div className="flex justify-center my-4">
            <QRCodeSVG value={link.url} size={120} level="M" />
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <DollarSign size={16} /> Valor
              </div>
              <span className="text-sm font-semibold text-[#1a1a2e]">{formatCurrency(link.amount)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <ExternalLink size={16} /> Descrição
              </div>
              <span className="text-sm text-[#1a1a2e]">{link.description}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <Calendar size={16} /> Criado em
              </div>
              <span className="text-sm text-[#1a1a2e]">{formatDate(link.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <Calendar size={16} /> Expiração
              </div>
              <span className="text-sm text-[#1a1a2e]">
                {link.expiresAt ? formatDate(link.expiresAt) : 'Não expira'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#F5F7FA]">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <Eye size={16} /> Visualizações
              </div>
              <span className="text-sm font-semibold text-[#1a1a2e]">{link.views}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <BarChart3 size={16} /> Pagamentos
              </div>
              <span className="text-sm font-semibold text-[#1a1a2e]">{link.payments}</span>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/edit-link/${link.id}`)}
          className="btn-secondary mt-4"
        >
          <Edit3 size={18} className="mr-2" /> Editar link
        </motion.button>
      </div>
    </div>
  )
}
