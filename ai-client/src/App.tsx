import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store/store'
import Navbar from './components/Navbar'
import LoadingSpinner from './components/ui/LoadingSpinner'

const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CareerAI = lazy(() => import('./pages/CareerAI'))
const Auth = lazy(() => import('./pages/Auth'))
const AiTerminalWidget = lazy(() => import('./components/AiTerminalWidget'))

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
