import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useLinksStore } from '../stores/linksStore'

export function EditLink() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const link = useLinksStore((s) => s.links.find((l) => l.id === id))
  const updateLink = useLinksStore((s) => s.updateLink)
  const deleteLink = useLinksStore((s) => s.deleteLink)

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [expiration, setExpiration] = useState('never')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (link) {
      const val = link.amount.toFixed(2)
      const [int, dec] = val.split('.')
      setAmount(`${parseInt(int).toLocaleString('pt-BR')},${dec}`)
      setDescription(link.description)
      setSlug(link.slug)
      setExpiration(link.expiration)
    }
  }, [link])

  if (!link) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <p className="text-[#6b7280]">Link não encontrado.</p>
      </div>
    )
  }

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
    setAmount(formatCurrency(nums))
  }

  const parseAmount = () => {
    const cleaned = amount.replace(/\./g, '').replace(',', '.')
    return parseFloat(cleaned) || 0
  }

  const handleSave = () => {
    const val = parseAmount()
    if (!val || val <= 0) return
    setLoading(true)
    updateLink(id!, {
      amount: val,
      description: description || 'Link de pagamento',
      slug: slug || `link-${Date.now()}`,
      expiration,
    })
    setTimeout(() => {
      setLoading(false)
      navigate(`/link-details/${id}`)
    }, 500)
  }

  const handleDelete = () => {
    deleteLink(id!)
    navigate('/links')
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
          <ArrowLeft size={20} color="#1a1a2e" />
        </button>
      </div>

      <div className="px-6 flex-1 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#1a1a2e] mt-2">Editar Link</h1>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#6b7280] mb-1 block">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-medium">R$</span>
              <input className="input-field pl-10 text-lg font-bold" value={amount} onChange={handleAmountChange} inputMode="numeric" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#6b7280] mb-1 block">Descrição</label>
            <input className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-[#6b7280] mb-1 block">URL</label>
            <div className="flex items-center bg-[#F5F7FA] rounded-[12px] px-4 h-[54px]">
              <span className="text-[#6b7280] text-sm shrink-0">gopay.me/</span>
              <input className="flex-1 bg-transparent outline-none text-[16px] ml-1" value={slug} onChange={(e) => setSlug(e.target.value)} />
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

      <div className="px-6 pb-10 space-y-3">
        <button onClick={handleSave} disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={22} className="animate-spin" /> : 'Salvar Alterações'}
        </button>

        {showConfirm ? (
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 text-sm">Cancelar</button>
            <button onClick={handleDelete} className="btn-danger flex-1 text-sm">Confirmar exclusão</button>
          </div>
        ) : (
          <button onClick={() => setShowConfirm(true)} className="btn-danger">
            <Trash2 size={18} className="mr-2" /> Excluir link
          </button>
        )}
      </div>
    </div>
  )
}
