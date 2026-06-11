import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, List, Activity, User, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { useGatewayStore } from '../stores/gatewayStore'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/create-link', icon: PlusCircle, label: 'Criar Link' },
  { path: '/links', icon: List, label: 'Meus Links' },
  { path: '/activity', icon: Activity, label: 'Atividade' },
  { path: '/profile', icon: User, label: 'Perfil' },
]

export function Sidebar() {
  const location = useLocation()
  const { isAuthenticated, logout } = useAuthStore()
  const { connectedGateway } = useGatewayStore()

  if (!isAuthenticated) return null

  return (
    <aside className="w-64 bg-white border-r border-[#F5F7FA] flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-[#F5F7FA]">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#0066FF' }}>
          <span className="text-2xl font-extrabold text-white">G</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#1a1a2e] mt-3">GoPay</h1>
        {connectedGateway && (
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-[#0066FF]/10 text-[#0066FF] rounded-full">
            {connectedGateway.toUpperCase()} Conectado
          </span>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <NavLink
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0066FF] text-white shadow-md'
                    : 'text-[#6b7280] hover:bg-[#F5F7FA] hover:text-[#1a1a2e]'
                }`}
              >
                <item.icon size={20} style={{ color: isActive ? 'white' : '#9ca3af' }} />
                {item.label}
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#F5F7FA] space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  )
}