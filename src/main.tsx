import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register Service Worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/pagesgopay/sw.js', { scope: '/pagesgopay/' })
      .then((reg) => {
        console.log('[GoPay] Service Worker registrado:', reg.scope)
      })
      .catch((err) => {
        console.warn('[GoPay] SW registration failed:', err)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
