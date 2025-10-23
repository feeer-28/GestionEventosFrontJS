import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: current, hydrated } = useAuth()
  if (!hydrated) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role) {
    const cur = (current || '').toString().toLowerCase()
    const req = role.toString().toLowerCase()
    const ok = cur === req || (req === 'administrador' && cur === 'admin')
    if (!ok) return <Navigate to="/" replace />
  }
  return children
}
