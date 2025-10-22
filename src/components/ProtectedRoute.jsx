import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: current } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && current !== role) return <Navigate to="/" replace />
  return children
}
