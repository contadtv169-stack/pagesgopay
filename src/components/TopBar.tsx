import { Menu, Bell, User, ChevronDown, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useNotificationsStore } from '../stores/notificationsStore'

export function TopBar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { notifications, unreadCount } = useNotificationsStore()

  if (!isAuthenticated) return null

  return (
    <header className="h-16 bg-white border-b border-[#F5F7FA] flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#0066FF' }}>
          <span className="text-sm font-extrabold text-white">G</span>
        </div>
        <h1 className="text-lg font-bold text-[#1a1a2e]">GoPay</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl hover:bg-[#F5F7FA] transition-colors">
          <Bell size={22} color="#4b5563" />
          {unreadCount() > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount() > 9 ? '9+' : unreadCount()}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-[#F5F7FA]">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#0066FF' }}>
            <span className="text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-[#1a1a2e]">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-[#9ca3af]">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}