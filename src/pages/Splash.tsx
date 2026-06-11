import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/welcome'), 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center"
      style={{ background: '#0066FF' }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <svg viewBox="0 0 100 100" width={70} height={70}>
            <text
              x="50" y="72"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="66" fontWeight="800"
              fill="white" textAnchor="middle"
            >
              G
            </text>
            <circle cx="72" cy="28" r="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <path d="M72 35 Q72 48 62 54 Q52 60 52 48" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-5xl font-extrabold text-white tracking-tight"
      >
        GoPay
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-white/80 text-lg mt-3 font-light tracking-wide"
      >
        Receba. Conecte. Cresça.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-12"
      >
        <div className="w-8 h-8 border-2 border-white/30 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
        </div>
      </motion.div>
    </div>
  )
}
