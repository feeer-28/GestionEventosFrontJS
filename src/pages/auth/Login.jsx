import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthAPI, encodeBasic } from '../../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await AuthAPI.login(email, password)
      const basic = token || encodeBasic(email, password)
      localStorage.setItem('token', basic)
      localStorage.setItem('user', JSON.stringify(user))
      if (user.rol === 'administrador') navigate('/admin')
      else navigate('/user')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex justify-start">
          <button type="button" onClick={()=>navigate('/')} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border text-blue-900 hover:bg-slate-50">
            <i className="bi bi-arrow-left" /> Volver
          </button>
        </div>
        <h2 className="text-2xl font-bold text-blue-900 text-center">Iniciar sesión</h2>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600">Correo</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Contraseña</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
          </div>
          <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="text-center text-sm">
          <a href="/register" className="text-purple-600 hover:underline">Crear cuenta</a>
        </div>
      </div>
    </div>
  )
}
