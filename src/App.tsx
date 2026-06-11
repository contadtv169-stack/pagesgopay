import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
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

const showNavPaths = ['/dashboard', '/links', '/create-link', '/activity', '/profile']

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const showPermission = useNotificationsStore((s) => s.showPermission)
  const setShowPermission = useNotificationsStore((s) => s.setShowPermission)
  const checkSession = useAuthStore((s) => s.checkSession)
  const subscribeToRealtime = useNotificationsStore((s) => s.subscribeToRealtime)
  const loadFromSupabase = useNotificationsStore((s) => s.loadFromSupabase)
  const fetchLinksSupabase = useLinksStore((s) => s.fetchLinks)
  const location = window.location.pathname

  useEffect(() => {
    checkSession()
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

  return (
    <div className="iphone-frame">
      <AnimatePresence mode="wait">
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>

      {showNav && <BottomNav />}
      {showNotifPermission && (
        <NotificationPermission onClose={() => setShowPermission(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}
