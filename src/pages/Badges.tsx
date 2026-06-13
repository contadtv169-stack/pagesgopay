import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Medal, Download, Share2, Star, Award, Trophy, Target } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useGatewayStore } from '../stores/gatewayStore'

interface Badge {
  id: string
  title: string
  goal: number
  icon: string
  color: string
}

const BADGES: Badge[] = [
  { id: 'bronze', title: 'Bronze', goal: 100, icon: '🥉', color: '#cd7f32' },
  { id: 'silver', title: 'Prata', goal: 500, icon: '🥈', color: '#c0c0c0' },
  { id: 'gold', title: 'Ouro', goal: 1000, icon: '🥇', color: '#ffd700' },
  { id: 'diamond', title: 'Diamante', goal: 5000, icon: '💎', color: '#b9f2ff' },
  { id: 'ruby', title: 'Rubi', goal: 10000, icon: '🔴', color: '#e0115f' },
  { id: 'crown', title: 'Coroa', goal: 50000, icon: '👑', color: '#8b5cf6' },
]

export function Badges() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const balance = useGatewayStore((s) => s.balance)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const totalReceived = balance?.totalReceived || 0
  const currentBadge = BADGES.filter((b) => totalReceived >= b.goal).pop() || null
  const nextBadge = BADGES.find((b) => totalReceived < b.goal) || null

  const generateBadgeDataUrl = (badge: Badge): string => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 800
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const gradient = ctx.createLinearGradient(0, 0, 600, 800)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, 800)

    ctx.strokeStyle = badge.color
    ctx.lineWidth = 4
    ctx.strokeRect(20, 20, 560, 760)

    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.arc(300, 220, 100, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = badge.color
    ctx.font = '100px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(badge.icon, 300, 250)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(badge.title, 300, 340)

    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '18px sans-serif'
    ctx.fillText('Meta: R$ ' + badge.goal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 300, 390)

    ctx.fillStyle = '#0066FF'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText('GoPay', 300, 480)

    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '20px sans-serif'
    ctx.fillText(user?.name || 'Usuário', 300, 540)

    const achievedDate = new Date().toLocaleDateString('pt-BR')
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '14px sans-serif'
    ctx.fillText(`Conquistado em: ${achievedDate}`, 300, 590)

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '12px sans-serif'
    ctx.fillText('Receba. Conecte. Cresça.', 300, 640)

    return canvas.toDataURL('image/png')
  }

  const handleDownload = (badge: Badge) => {
    const dataUrl = generateBadgeDataUrl(badge)
    const link = document.createElement('a')
    link.download = `gopay-badge-${badge.id}.png`
    link.href = dataUrl
    link.click()
  }

  const handleShare = async (badge: Badge) => {
    if (navigator.share) {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 600
        canvas.height = 800
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const dataUrl = generateBadgeDataUrl(badge)
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], `gopay-badge-${badge.id}.png`, { type: 'image/png' })
        await navigator.share({ title: 'GoPay Badge', text: `Conquistei a placa ${badge.title} no GoPay!`, files: [file] })
      } catch {}
    } else {
      handleDownload(badge)
    }
  }

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      <div className="px-4 pt-4 pb-2 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
            <ArrowLeft size={20} color="#1a1a2e" />
          </button>
          <h1 className="text-lg font-bold text-[#1a1a2e]">Placas Digitais</h1>
        </div>
      </div>

      <div className="flex-1 px-4 mt-3 overflow-y-auto pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-blue rounded-card p-6 text-white">
          <div className="flex items-center gap-3">
            <Medal size={28} color="rgba(255,255,255,0.8)" />
            <div>
              <p className="text-lg font-bold">Total recebido</p>
              <p className="text-3xl font-extrabold mt-1">{formatCurrency(totalReceived)}</p>
            </div>
          </div>
          {nextBadge && (
            <div className="mt-4 bg-white/10 rounded-xl p-4">
              <p className="text-sm text-white/70">Próxima meta</p>
              <p className="font-bold mt-1">{nextBadge.icon} {nextBadge.title} - {formatCurrency(nextBadge.goal)}</p>
              <div className="w-full h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (totalReceived / nextBadge.goal) * 100)}%` }} />
              </div>
              <p className="text-xs text-white/50 mt-1">{formatCurrency(totalReceived)} / {formatCurrency(nextBadge.goal)}</p>
            </div>
          )}
          {currentBadge && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Award size={16} color="#ffd700" />
              <span>Placa atual: {currentBadge.icon} {currentBadge.title}</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {BADGES.map((badge, i) => {
            const achieved = totalReceived >= badge.goal
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`card-white rounded-card p-4 ${achieved ? 'cursor-pointer' : 'opacity-40'}`}
                onClick={() => achieved && setSelectedBadge(badge)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="text-sm font-bold text-[#1a1a2e]">{badge.title}</p>
                  <p className="text-xs text-[#6b7280] mt-1">{formatCurrency(badge.goal)}</p>
                  {achieved ? (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-medium">
                      Conquistado ✓
                    </span>
                  ) : (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
                      {formatCurrency(badge.goal - totalReceived)} restante
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedBadge(null)}
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <canvas ref={canvasRef} width={600} height={800} className="hidden" />
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{selectedBadge.icon}</div>
                <h3 className="text-xl font-bold text-[#1a1a2e]">{selectedBadge.title}</h3>
                <p className="text-sm text-[#6b7280] mt-1">GoPay - {user?.name}</p>
                <p className="text-xs text-[#9ca3af] mt-1">Meta: {formatCurrency(selectedBadge.goal)}</p>
              </div>
              <div className="space-y-2">
                <button onClick={() => handleDownload(selectedBadge)} className="btn-primary">
                  <Download size={18} className="mr-2" /> Baixar PNG
                </button>
                <button onClick={() => handleShare(selectedBadge)} className="btn-secondary">
                  <Share2 size={18} className="mr-2" /> Compartilhar
                </button>
                <button onClick={() => setSelectedBadge(null)} className="w-full text-center text-sm text-[#6b7280] py-2">
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
