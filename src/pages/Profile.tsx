import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Bell, Shield, HelpCircle, MessageCircle,
  FileText, Lock, ChevronRight, LogOut, ExternalLink, CheckCircle2,
  Smartphone, Wifi, Camera, Medal, Save, X,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useGatewayStore } from '../stores/gatewayStore'
import { useNotificationsStore } from '../stores/notificationsStore'
import { supabase } from '../lib/supabase'

export function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { connectedGateway, disconnect } = useGatewayStore()
  const unreadCount = useNotificationsStore((s) => s.unreadCount())
  const [showLogout, setShowLogout] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const handleAvatarUpload = (file: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) setAvatarUrl(e.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        await supabase.from('users').update({
          name: editName.trim(),
          avatar_url: avatarUrl,
        }).eq('auth_id', authUser.id)
        useAuthStore.setState({ user: { ...useAuthStore.getState().user!, name: editName.trim() } })
      }
    } catch {}
    setSaving(false)
    setEditing(false)
  }

  const handleLogout = () => {
    logout()
    disconnect()
    navigate('/welcome')
  }

  return (
    <div className="h-full w-full bg-[#F5F7FA] flex flex-col">
      <div className="px-4 pt-4 pb-2 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FA]">
              <ArrowLeft size={20} color="#1a1a2e" />
            </button>
            <h1 className="text-lg font-bold text-[#1a1a2e]">Conta</h1>
          </div>
          <button onClick={() => navigate('/notifications')} className="relative w-10 h-10 rounded-full bg-[#F5F7FA] flex items-center justify-center">
            <Bell size={20} color="#1a1a2e" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 mt-3 overflow-y-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-white rounded-card p-6 flex flex-col items-center relative"
        >
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden"
              style={{ background: avatarUrl ? 'none' : 'linear-gradient(135deg, #0066FF 0%, #0048CC 100%)' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0066FF] flex items-center justify-center border-2 border-white">
              <Camera size={12} color="white" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f) }} />
          </div>

          {editing ? (
            <div className="w-full mt-4 space-y-3">
              <input
                className="input-field text-center text-lg font-bold"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Seu nome"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-secondary flex-1 text-sm">
                  <X size={16} className="mr-1" /> Cancelar
                </button>
                <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex-1 text-sm">
                  <Save size={16} className="mr-1" /> {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#1a1a2e] mt-3">{user?.name}</h2>
              <p className="text-sm text-[#6b7280]">{user?.email}</p>
              <button onClick={() => { setEditName(user?.name || ''); setEditing(true) }} className="mt-2 text-xs font-medium text-[#0066FF]">
                Editar perfil
              </button>
            </>
          )}

          {connectedGateway && (
            <div className="mt-3 px-3 py-1.5 rounded-full bg-green-50 flex items-center gap-1.5">
              <CheckCircle2 size={14} color="#16a34a" />
              <span className="text-xs font-medium text-green-700">
                Gateway: {connectedGateway === 'krypt' ? 'KryptGateway' : 'AbacatePay'} ✓
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-white rounded-card mt-4 overflow-hidden"
          onClick={() => navigate('/badges')}
        >
          <div className="flex items-center justify-between px-4 py-4 cursor-pointer active:bg-[#F5F7FA]">
            <div className="flex items-center gap-3">
              <Medal size={20} color="#d97706" />
              <span className="text-sm font-medium text-[#1a1a2e]">Placas Digitais</span>
            </div>
            <ChevronRight size={16} color="#d1d5db" />
          </div>
        </motion.div>

        <div className="mt-4 space-y-4">
          {[
            {
              title: 'Configurações',
              items: [
                { icon: Lock, label: 'Alterar senha' },
                { icon: Bell, label: 'Notificações' },
                { icon: Shield, label: 'Privacidade' },
              ],
            },
            {
              title: 'Gateway',
              items: [
                { icon: Wifi, label: 'Gateway conectado', badge: true },
                { icon: ExternalLink, label: 'Reconectar / Desconectar' },
              ],
            },
            {
              title: 'Suporte',
              items: [
                { icon: HelpCircle, label: 'Ajuda' },
                { icon: MessageCircle, label: 'Falar com suporte' },
                { icon: FileText, label: 'Termos de uso' },
                { icon: Shield, label: 'Política de privacidade' },
              ],
            },
          ].map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + 0.1 * si }}
              className="card-white rounded-card overflow-hidden"
            >
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider px-4 pt-4 pb-1">
                {section.title}
              </p>
              {section.items.map((item, ii) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.label === 'Reconectar / Desconectar') navigate('/connect-gateway')
                  }}
                  className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#F5F7FA] transition-colors"
                  style={{ borderBottom: ii < section.items.length - 1 ? '1px solid #F5F7FA' : 'none' }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} color="#6b7280" />
                    <span className="text-sm text-[#1a1a2e]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.badge && connectedGateway && (
                      <span className="text-xs text-green-600 font-medium">Conectado</span>
                    )}
                    <ChevronRight size={16} color="#d1d5db" />
                  </div>
                </button>
              ))}
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          {showLogout ? (
            <div className="flex gap-2">
              <button onClick={() => setShowLogout(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleLogout} className="btn-danger flex-1">
                <LogOut size={18} className="mr-2" /> Sair
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogout(true)} className="btn-danger">
              <LogOut size={18} className="mr-2" /> Sair
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
