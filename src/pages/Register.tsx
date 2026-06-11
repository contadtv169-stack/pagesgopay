import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function Register() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Nome é obrigatório'
    if (!email.trim()) errs.email = 'E-mail é obrigatório'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'E-mail inválido'
    if (!password) errs.password = 'Senha é obrigatória'
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      const ok = await register(name.trim(), email.trim(), password)
      if (ok) {
        navigate('/connect-gateway')
      } else {
        setError('Este e-mail já está cadastrado.')
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
          <ArrowLeft size={20} color="#1a1a2e" />
        </motion.button>
      </div>

      <div className="px-6 flex-1">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] mt-2">
          Criar conta
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[#6b7280] mt-1 text-sm">
          Vamos começar
        </motion.p>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </motion.div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <input
              className="input-field"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldErrors((prev) => ({ ...prev, name: '' })) }}
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <input
              className="input-field"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: '' })) }}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          <div className="relative">
            <input
              className="input-field pr-12"
              placeholder="Senha"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: '' })) }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPwd ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
            </button>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-3">
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading} className="btn-primary"
        >
          {loading ? <Loader2 size={22} className="animate-spin" /> : 'Criar conta'}
        </motion.button>

        <button onClick={() => navigate('/login')} className="w-full text-center text-sm font-medium text-[#0066FF] py-2">
          Já tem uma conta? Entrar
        </button>
      </div>
    </div>
  )
}
