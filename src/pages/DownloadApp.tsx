import { motion } from 'framer-motion'
import { Download, Smartphone, Monitor, Globe, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function DownloadApp() {
  const navigate = useNavigate()

  const steps = [
    'Crie sua conta no GoPay',
    'Conecte um gateway (KryptGateway, PixGo ou AbacatePay)',
    'Crie links de pagamento com valor e descrição',
    'Compartilhe o link com seus clientes',
    'Receba pagamentos direto no gateway conectado',
  ]

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="pt-12 pb-6 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0066FF 0%, #0048CC 100%)' }}>
        <button onClick={() => navigate(-1)} className="text-white/80 mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft size={18} /> Voltar
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 100 100" width={44} height={44}>
              <text x="50" y="72" fontFamily="system-ui" fontSize="66" fontWeight="800" fill="white" textAnchor="middle">G</text>
              <circle cx="72" cy="28" r="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
              <path d="M72 35 Q72 48 62 54 Q52 60 52 48" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white">GoPay</h1>
          <p className="text-white/80 text-sm mt-1">Baixe o app ou use direto no navegador</p>
        </motion.div>
      </div>

      <div className="flex-1 px-6 pt-6 space-y-5 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 flex items-center justify-center">
              <Monitor size={22} color="#0066FF" />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a2e] text-base">Versão Web</h3>
              <p className="text-xs text-[#6b7280]">PC e Celular</p>
            </div>
          </div>
          <p className="text-sm text-[#6b7280] leading-relaxed">
            Acesse pelo navegador no PC ou celular sem instalar nada.
            Todas as funções disponíveis: criar links, conectar gateways, acompanhar pagamentos.
          </p>
          <a
            href="/"
            className="btn-primary mt-4 text-sm"
            onClick={(e) => { e.preventDefault(); navigate('/welcome') }}
          >
            <Globe size={18} className="mr-2" /> Abrir GoPay Web
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Smartphone size={22} color="#16a34a" />
            </div>
            <div>
              <h3 className="font-bold text-[#1a1a2e] text-base">App Android (APK)</h3>
              <p className="text-xs text-[#6b7280]">Celular apenas</p>
            </div>
          </div>
          <p className="text-sm text-[#6b7280] leading-relaxed">
            Baixe o APK para instalar no seu celular Android. Experiência nativa com notificações push.
          </p>
          <a
            href="/GoPay-APK.apk"
            download
            className="btn-primary mt-4 text-sm"
            style={{ background: '#16a34a', boxShadow: '0 4px 15px rgba(22,163,74,0.3)' }}
          >
            <Download size={18} className="mr-2" /> Baixar APK (4.5 MB)
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#F5F7FA] rounded-2xl p-5">
          <h3 className="font-bold text-[#1a1a2e] text-base mb-4">Passo a Passo</h3>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0066FF] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-white">{i + 1}</span>
                </div>
                <p className="text-sm text-[#4b5563]">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              <strong className="text-[#6b7280]">Servidor Real:</strong> O GoPay usa Supabase como backend.
              Os dados são salvos em nuvem e sincronizados entre Web e APK.
              Crie sua conta, conecte um gateway e comece a receber pagamentos.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-2 justify-center pb-6">
          <CheckCircle2 size={14} color="#16a34a" />
          <span className="text-xs text-[#6b7280]">App 100% funcional com servidor real</span>
        </motion.div>
      </div>
    </div>
  )
}