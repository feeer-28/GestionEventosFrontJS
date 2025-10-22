import { useState } from 'react'
import { AuthAPI } from '../lib/api'

export default function ProfileForm({ onClose, onSaved }) {
  const stored = JSON.parse(localStorage.getItem('user') || 'null')
  const [form, setForm] = useState({
    nombre: stored?.nombre || '',
    apellidos: stored?.apellidos || '',
    tipodocumento: stored?.tipodocumento || 'CC',
    documento: stored?.documento || '',
    email: stored?.email || '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    if (!stored) return
    setError('')
    setLoading(true)
    try {
      const payload = {
        nombre: form.nombre,
        apellidos: form.apellidos,
        tipodocumento: form.tipodocumento,
        documento: form.documento,
        email: form.email,
      }
      if (form.password) payload.password = form.password
      const updated = await AuthAPI.update(stored.idusuario, payload)
      const user = { ...stored, ...updated }
      localStorage.setItem('user', JSON.stringify(user))
      onSaved?.(user)
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm text-slate-600">Nombres</label>
        <input value={form.nombre} onChange={e=>setField('nombre', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Apellidos</label>
        <input value={form.apellidos} onChange={e=>setField('apellidos', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Tipo de documento</label>
        <select value={form.tipodocumento} onChange={e=>setField('tipodocumento', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2">
          <option value="CC">Cedula</option>
          <option value="TI">Tarjeta de identidad</option>
          <option value="CE">Cedula extranjera</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Número de documento</label>
        <input value={form.documento} onChange={e=>setField('documento', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
    
      <div>
        <label className="block text-sm text-slate-600">Correo</label>
        <input type="email" value={form.email} onChange={e=>setField('email', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Nueva contraseña (opcional)</label>
        <input type="password" value={form.password} onChange={e=>setField('password', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
