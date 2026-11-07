import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store/store'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import LoadingSpinner from './components/ui/LoadingSpinner'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const CareerAI = lazy(() => import('./pages/CareerAI'))
const Auth = lazy(() => import('./pages/Auth'))
const AiTerminalWidget = lazy(() => import('./components/AiTerminalWidget'))

function App() {
  const user = useSelector((state: RootState) => state.auth.user)

  return (
    <Router>
      <Navbar />
      <main className="container mt-3 pb-5">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
            <Route path="/career" element={user ? <CareerAI /> : <Navigate to="/auth" replace />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
      {user && (
        <Suspense fallback={null}>
          <AiTerminalWidget />
        </Suspense>
      )}
    </Router>
  )
}

export default App
