import { lazy, Suspense, type ComponentType } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store/store'
import Navbar from './components/Navbar'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Auto-recovery for lazy loaded chunks after new deployments / cache updates
function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
    )
    try {
      const component = await factory()
      window.sessionStorage.setItem('retry-lazy-refreshed', 'false')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('retry-lazy-refreshed', 'true')
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    }
  })
}

const Landing = lazyWithRetry(() => import('./pages/Landing'))
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'))
const CareerAI = lazyWithRetry(() => import('./pages/CareerAI'))
const Auth = lazyWithRetry(() => import('./pages/Auth'))
const AiTerminalWidget = lazyWithRetry(() => import('./components/AiTerminalWidget'))

function App() {
  const user = useSelector((state: RootState) => state.auth.user)

  return (
    <Router>
      <Navbar />
      <div className="container mt-3 pb-5">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
            <Route path="/career" element={user ? <CareerAI /> : <Navigate to="/auth" replace />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </div>
      {user && (
        <Suspense fallback={null}>
          <AiTerminalWidget />
        </Suspense>
      )}
    </Router>
  )
}

export default App
