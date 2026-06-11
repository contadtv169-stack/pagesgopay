import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Link as LinkIcon, Clock, DollarSign } from 'lucide-react'
import { useLinksStore } from '../stores/linksStore'

export function LinksList() {
  const navigate = useNavigate()
  const links = useLinksStore((s) => s.links)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')

  const filtered = links.filter((l) => {
    if (filter === 'active' && l.status !== 'active') return false
    if (filter === 'expired' && l.status !== 'expired') return false
    if (search) {
      const q = search.toLowerCase()
      return l.slug.includes(q) || l.description.toLowerCase().includes(q)
    }
    return true
  })

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('pt-BR')
  }

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      <div className="px-4 pt-4 pb-2 bg-white">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Links</h1>

        <div className="relative mt-3">
          <Search size={18} color="#9ca3af" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="input-field pl-10 bg-[#F5F7FA]"
            placeholder="Buscar links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-3">
          {(['all', 'active', 'expired'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-[10px] text-xs font-medium transition-colors ${
                filter === f ? 'bg-[#0066FF] text-white' : 'bg-[#F5F7FA] text-[#6b7280]'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Expirados'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 mt-3 overflow-y-auto pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16">
            <LinkIcon size={48} color="#d1d5db" strokeWidth={1} />
            <p className="text-[#9ca3af] mt-4 text-sm">Nenhum link encontrado</p>
            <button onClick={() => navigate('/create-link')} className="text-[#0066FF] text-sm font-medium mt-2">
              Criar primeiro link
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/link-details/${link.id}`)}
                className="card-white rounded-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a2e] truncate">{link.url}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5 truncate">{link.description}</p>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ml-2 ${
                      link.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {link.status === 'active' ? 'Ativo' : 'Expirado'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#6b7280]">
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} />
                    <span>{formatCurrency(link.amount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatDate(link.createdAt)}</span>
                  </div>
                  <span>{link.payments} pagamento(s)</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
