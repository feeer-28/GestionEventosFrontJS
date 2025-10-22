import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthAPI } from '../../lib/api'

export default function Register() {
  const [form, setForm] = useState({ nombre: '', apellidos: '', tipodocumento: 'CC', documento: '', email: '', password: '', confirmpassword: '', rol: 'cliente' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (form.password !== form.confirmpassword) {
        setError('Las contraseñas no coinciden')
        setLoading(false)
        return
      }
      const payload = { nombre: form.nombre, apellidos: form.apellidos, tipodocumento: form.tipodocumento, documento: form.documento, email: form.email, password: form.password, rol: form.rol }
      const { user, token } = await AuthAPI.register(payload)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      if (user.rol === 'administrador') navigate('/admin')
      else navigate('/user')
    } catch (err) {
      setError(err.message || 'Error al registrar')
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
        <h2 className="text-2xl font-bold text-blue-900 text-center">Crear cuenta</h2>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600">Nombres</label>
              <input value={form.nombre} onChange={(e)=>setField('nombre', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Tus nombres" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Apellidos</label>
              <input value={form.apellidos} onChange={(e)=>setField('apellidos', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Tus apellidos" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Tipo de documento</label>
              <select value={form.tipodocumento} onChange={(e)=>setField('tipodocumento', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="CC">Cedula</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="CE">Cedula extranjera</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600">Numero de documento</label>
              <input type="text" value={form.documento} onChange={(e)=>setField('documento', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ingresa tu numero de documento" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-600">Correo</label>
              <input type="email" value={form.email} onChange={(e)=>setField('email', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Contraseña</label>
              <input type="password" value={form.password} onChange={(e)=>setField('password', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Confirmar contraseña</label>
              <input type="password" value={form.confirmpassword} onChange={(e)=>setField('confirmpassword', e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
            </div>
          </div>

          <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white">
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <div className="text-center text-sm">
          <a href="/login" className="text-purple-600 hover:underline">Ya tengo cuenta</a>
        </div>
      </div>
    </div>
  )
}
