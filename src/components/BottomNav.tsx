import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Link, BarChart3, User, Plus } from 'lucide-react'

const tabs = [
  { path: '/dashboard', icon: Home, label: 'Início' },
  { path: '/links', icon: Link, label: 'Links' },
  { path: '/create-link', icon: Plus, label: '', center: true },
  { path: '/activity', icon: BarChart3, label: 'Atividade' },
  { path: '/profile', icon: User, label: 'Conta' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white"
      style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.06)' }}
    >
      <div
        className="flex items-center justify-around relative mx-auto"
        style={{
          maxWidth: 393,
          height: 83,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          const Icon = tab.icon

          if (tab.center) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative -top-3 flex items-center justify-center"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-[58px] h-[58px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #0066FF 0%, #0048CC 100%)',
                    boxShadow: '0 4px 15px rgba(0,102,255,0.4)',
                  }}
                >
                  <Plus size={28} color="white" strokeWidth={3} />
                </motion.div>
              </button>
            )
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-0.5 relative"
              style={{ minWidth: 56 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-6 h-[3px] rounded-full"
                  style={{ background: '#0066FF' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                color={isActive ? '#0066FF' : '#9ca3af'}
              />
              <span
                className="text-[11px] font-medium"
                style={{ color: isActive ? '#0066FF' : '#9ca3af' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
