import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Zap, Shield, ArrowRight, Download, Smartphone } from 'lucide-react'

const benefits = [
  { icon: Zap, text: 'Links de pagamento rápidos e personalizados' },
  { icon: Shield, text: 'Conexão com gateways segura e prática' },
  { icon: ArrowRight, text: 'Saque fácil direto no app conectado' },
]

export function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div
        className="pt-16 pb-12 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0066FF 0%, #0048CC 100%)' }}
      >
        <div
          className="absolute -bottom-6 left-0 right-0 h-12"
          style={{
            background: '#fff',
            borderRadius: '50% 50% 0 0',
          }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 100 100" width={56} height={56}>
              <text x="50" y="72" fontFamily="system-ui, -apple-system, sans-serif" fontSize="66" fontWeight="800" fill="white" textAnchor="middle">G</text>
              <circle cx="72" cy="28" r="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
              <path d="M72 35 Q72 48 62 54 Q52 60 52 48" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">GoPay</h1>
        </motion.div>
      </div>

      <div className="flex-1 px-6 -mt-2">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-[#1a1a2e] text-center"
        >
          Bem-vindo ao GoPay
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[#6b7280] text-center mt-2 text-sm leading-relaxed"
        >
          A maneira mais simples de criar links de pagamento.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-4"
        >
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 bg-[#F5F7FA] rounded-card p-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center shrink-0">
                <b.icon size={20} color="#0066FF" />
              </div>
              <span className="text-sm font-medium text-[#4b5563]">{b.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/register')}
          className="btn-primary"
        >
          Começar
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/login')}
          className="w-full text-center text-sm font-medium text-[#0066FF] py-2"
        >
          Já tenho uma conta
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/download')}
          className="w-full text-center text-xs text-[#9ca3af] py-1 flex items-center justify-center gap-1"
        >
          <Smartphone size={12} /> Baixar App Android
        </motion.button>
      </div>
    </div>
  )
}
