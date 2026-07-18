import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store/store'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import CareerAI from './pages/CareerAI'
import Landing from './pages/Landing'
import AiTerminalWidget from './components/AiTerminalWidget'

function App() {
  const user = useSelector((state: RootState) => state.auth.user)

  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/career" element={user ? <CareerAI /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
        </Routes>
      </div>
      {user && <AiTerminalWidget />}
    </Router>
  )
}

export default App
