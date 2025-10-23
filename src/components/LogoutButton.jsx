import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LogoutButton({ className = '', children = 'Cerrar sesión', redirectTo = '/' }) {
  const { clearAuth } = useAuth()
  const navigate = useNavigate()

  async function onClick() {
    try {
      // Si hubiese logout de backend, podría invocarse aquí.
    } finally {
      clearAuth()
      navigate(redirectTo)
    }
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}
