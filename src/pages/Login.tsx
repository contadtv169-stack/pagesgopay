import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const ok = await login(email.trim(), password)
      if (ok) {
        navigate('/dashboard')
      } else {
        setError('E-mail ou senha incorretos.')
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.')
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

      <div className="px-6 flex-1">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] mt-2">
          Entrar
        </motion.h1>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </motion.div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <input
              className="input-field"
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <input
              className="input-field pr-12"
              placeholder="Senha"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPwd ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
            </button>
          </div>
        </div>

        <button className="text-sm font-medium text-[#0066FF] mt-4 text-left">
          Esqueci minha senha
        </button>
      </div>

      <div className="px-6 pb-10 space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? <Loader2 size={22} className="animate-spin" /> : 'Entrar'}
        </motion.button>

        <button onClick={() => navigate('/register')} className="w-full text-center text-sm font-medium text-[#0066FF] py-2">
          Criar conta
        </button>
      </div>
    </div>
  )
}
