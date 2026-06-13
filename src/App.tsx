import { useState, useEffect } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import { CaktoEditor } from './pages/CaktoEditor'
import { Activity } from './pages/Activity'
import { Withdraw } from './pages/Withdraw'
import { Profile } from './pages/Profile'
import { NotificationsPage } from './pages/Notifications'
import { CheckoutPage } from './pages/CheckoutPage'
import { DownloadApp } from './pages/DownloadApp'
import { useIsMobile } from './hooks/useIsMobile'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'

// FIX: APK usa file:// → HashRouter. Web usa BrowserRouter.
const isNative = Capacitor.isNativePlatform()

const showNavPaths = ['/dashboard', '/links', '/create-link', '/activity', '/profile']

function AppRoutes() {
  const [ready, setReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const showPermission = useNotificationsStore((s) => s.showPermission)
  const setShowPermission = useNotificationsStore((s) => s.setShowPermission)
  const checkSession = useAuthStore((s) => s.checkSession)
  const subscribeToRealtime = useNotificationsStore((s) => s.subscribeToRealtime)
  const loadFromSupabase = useNotificationsStore((s) => s.loadFromSupabase)
  const fetchLinksSupabase = useLinksStore((s) => s.fetchLinks)
  const location = useLocation()
  const isMobile = useIsMobile()

  useEffect(() => {
    // FIX: Wrap in try/catch — uncaught error during checkSession causes white screen
    const init = async () => {
      try {
        await checkSession()
      } catch (e) {
        console.error('[GoPay] checkSession error:', e)
        setInitError(String(e))
      } finally {
        setReady(true)
      }
    }
    init()

    // FIX: Only hide SplashScreen after JS is running, not on launch
    if (isNative) {
      import('@capacitor/splash-screen')
        .then(({ SplashScreen }) => SplashScreen.hide({ fadeOutDuration: 300 }))
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    // FIX: wrap in try/catch so errors don't crash the app
    try {
      loadFromSupabase().catch(() => {})
      fetchLinksSupabase().catch(() => {})
      const unsub = subscribeToRealtime()
      return () => { try { unsub() } catch {} }
    } catch {}
  }, [isAuthenticated])

  const showNav = showNavPaths.includes(location.pathname)
  const showNotifPermission = isAuthenticated && showPermission && !isNative

  // FIX: Loading screen keeps background blue — never shows white
  if (!ready) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0,
          background: '#0066FF',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <svg viewBox="0 0 100 100" width={70} height={70}>
            <text x="50" y="72" fontFamily="system-ui" fontSize="66"
              fontWeight="800" fill="white" textAnchor="middle">G</text>
          </svg>
        </div>
        <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>GoPay</h1>
        {initError && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 16, padding: '0 32px', textAlign: 'center' }}>
            Conectando...
          </p>
        )}
      </div>
    )
  }

  const routes = (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Splash />} />
      <Route path="/welcome" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Welcome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/connect-gateway" element={<ConnectGateway />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/create-link" element={isAuthenticated ? <CreateLink /> : <Navigate to="/login" replace />} />
      <Route path="/link-generated/:id" element={isAuthenticated ? <LinkGenerated /> : <Navigate to="/login" replace />} />
      <Route path="/links" element={isAuthenticated ? <LinksList /> : <Navigate to="/login" replace />} />
      <Route path="/link-details/:id" element={isAuthenticated ? <LinkDetails /> : <Navigate to="/login" replace />} />
      <Route path="/edit-link/:id" element={isAuthenticated ? <EditLink /> : <Navigate to="/login" replace />} />
      <Route path="/cakto-editor/:id" element={isAuthenticated ? <CaktoEditor /> : <Navigate to="/login" replace />} />
      <Route path="/activity" element={isAuthenticated ? <Activity /> : <Navigate to="/login" replace />} />
      <Route path="/withdraw" element={isAuthenticated ? <Withdraw /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
      <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" replace />} />
      <Route path="/checkout/:slug" element={<CheckoutPage />} />
      <Route path="/download" element={<DownloadApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )

  // FIX: no isMobile check needed on native — always mobile layout
  const isAppMobile = isNative || isMobile

  if (isAppMobile) {
    return (
      <div className="iphone-frame">
        {routes}
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
          {routes}
        </main>
      </div>
    </div>
  )
}

// FIX: APK usa HashRouter (funciona com file:///), web usa BrowserRouter
export default function App() {
  if (isNative) {
    return (
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    )
  }
  return (
    <BrowserRouter basename="/pagesgopay">
      <AppRoutes />
    </BrowserRouter>
  )
}
