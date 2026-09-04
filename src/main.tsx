import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const isAdmin = window.location.pathname.startsWith('/admin')

// Code-split: a regular visitor's bundle never has to download the admin
// panel (or its dependencies, like the QR code generator) — only /admin
// visits pay that cost.
const App = lazy(() => import('./App.tsx'))
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      {isAdmin ? <AdminApp /> : <App />}
    </Suspense>
  </StrictMode>,
)
