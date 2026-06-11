import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { useAuthStore } from './stores/authStore'
import { useNotificationsStore } from './stores/notificationsStore'
import { useLinksStore } from './stores/linksStore'
import { BottomNav } from './components/BottomNav'
import { NotificationPermission } from './components/NotificationPermission'
import { Splash } from './pages/Splash'
import { Welcome } from './pages/Welcome'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { ConnectGateway } from './pages/ConnectGateway'
import { Dashboard } from './pages/Dashboard'
import { CreateLink } from './pages/CreateLink'
import { LinkGenerated } from './pages/LinkGenerated'
import { LinksList } from './pages/LinksList'
import { LinkDetails } from './pages/LinkDetails'
import { EditLink } from './pages/EditLink'
import { Activity } from './pages/Activity'
import { Withdraw } from './pages/Withdraw'
import { Profile } from './pages/Profile'
import { NotificationsPage } from './pages/Notifications'
import { CheckoutPage } from './pages/CheckoutPage'
import { DownloadApp } from './pages/DownloadApp'
import { useIsMobile } from './hooks/useIsMobile'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'

const showNavPaths = ['/dashboard', '/links', '/create-link', '/activity', '/profile']

function AppRoutes() {
  const [ready, setReady] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const showPermission = useNotificationsStore((s) => s.showPermission)
  const setShowPermission = useNotificationsStore((s) => s.setShowPermission)
  const checkSession = useAuthStore((s) => s.checkSession)
  const subscribeToRealtime = useNotificationsStore((s) => s.subscribeToRealtime)
  const loadFromSupabase = useNotificationsStore((s) => s.loadFromSupabase)
  const fetchLinksSupabase = useLinksStore((s) => s.fetchLinks)
  const location = window.location.pathname
  const isMobile = useIsMobile()

  useEffect(() => {
    checkSession().finally(() => setReady(true))
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/splash-screen').then(({ SplashScreen }) => SplashScreen.hide()).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadFromSupabase()
      fetchLinksSupabase()
      const unsub = subscribeToRealtime()
      return () => unsub()
    }
  }, [isAuthenticated])

  const showNav = showNavPaths.includes(location)
  const showNotifPermission = isAuthenticated && showPermission

  const shared = (
    <Routes location={location} key={location}>
      <Route path="/" element={<Splash />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/connect-gateway" element={<ConnectGateway />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/create-link" element={isAuthenticated ? <CreateLink /> : <Navigate to="/login" />} />
      <Route path="/link-generated/:id" element={isAuthenticated ? <LinkGenerated /> : <Navigate to="/login" />} />
      <Route path="/links" element={isAuthenticated ? <LinksList /> : <Navigate to="/login" />} />
      <Route path="/link-details/:id" element={isAuthenticated ? <LinkDetails /> : <Navigate to="/login" />} />
      <Route path="/edit-link/:id" element={isAuthenticated ? <EditLink /> : <Navigate to="/login" />} />
      <Route path="/activity" element={isAuthenticated ? <Activity /> : <Navigate to="/login" />} />
      <Route path="/withdraw" element={isAuthenticated ? <Withdraw /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />} />
      <Route path="/checkout/:slug" element={<CheckoutPage />} />
      <Route path="/download" element={<DownloadApp />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )

  if (!ready) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={{ background: '#0066FF' }}>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 100 100" width={70} height={70}>
              <text x="50" y="72" fontFamily="system-ui" fontSize="66" fontWeight="800" fill="white" textAnchor="middle">G</text>
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">GoPay</h1>
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="iphone-frame">
        {shared}
        {showNav && <BottomNav />}
        {showNotifPermission && (
          <NotificationPermission onClose={() => setShowPermission(false)} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {shared}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
