import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store/store'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CareerAI from './pages/CareerAI'
import Auth from './pages/Auth'
import AiTerminalWidget from './components/AiTerminalWidget'

function App() {
  const user = useSelector((state: RootState) => state.auth.user)

  return (
    <Router>
      <Navbar />
      <div className="container mt-3 pb-5">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
          <Route path="/career" element={user ? <CareerAI /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      {user && <AiTerminalWidget />}
    </Router>
  )
}

export default App
