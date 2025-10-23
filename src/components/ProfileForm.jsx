import { useEffect, useState } from 'react'
import { UserProfileAPI } from '../lib/api'

export default function ProfileForm({ onClose, onSaved, userId }) {
  const stored = JSON.parse(localStorage.getItem('user') || 'null')
  function getUserId() {
    if (userId != null) return userId
    const candidates = [
      stored?.id_user,
      stored?.idusuario,
      stored?.id,
      stored?.idUser,
      stored?.user?.id_user,
      stored?.user?.idusuario,
      stored?.user?.id,
      stored?.user?.idUser,
    ]
    for (const v of candidates) {
      if (v !== undefined && v !== null) return v
    }
    return null
  }
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

  useEffect(() => {
    let active = true
    async function load() {
      if (!stored) return
      setError('')
      try {
        const id = getUserId()
        if (!id) { if (active) setError('No se encontró el identificador del usuario para cargar el perfil'); return }
        // Debug opcional
        // console.debug('ProfileForm.load stored:', stored, 'id:', id)
        const data = await UserProfileAPI.get(id)
        const fullName = data?.person?.full_name || ''
        const parts = String(fullName).trim().split(' ')
        const apellidos = parts.length > 1 ? parts.slice(1).join(' ') : ''
        const nombre = parts[0] || ''
        const tipodocumento = data?.person?.type_identification || 'CC'
        const documento = String(data?.person?.number_identification ?? '')
        const email = data?.email || ''
        // Persistimos id y email para futuros montajes
        try {
          const merged = { ...stored, id_user: data?.id_user ?? id, email }
          localStorage.setItem('user', JSON.stringify(merged))
        } catch {}
        if (active) setForm(p => ({ ...p, nombre, apellidos, tipodocumento, documento, email }))
      } catch (err) {
        if (active) setError(err.message || 'No se pudo cargar el perfil')
      }
    }
    load()
    return () => { active = false }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    if (!stored) return
    setError('')
    setLoading(true)
    try {
      const id = getUserId()
      const full_name = [form.nombre, form.apellidos].filter(Boolean).join(' ').trim()
      const payload = {
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
        person: {
          full_name,
          number_identification: Number(form.documento),
          type_identification: form.tipodocumento || 'CC',
        }
      }
      const updated = await UserProfileAPI.update(id, payload)
      const user = {
        ...stored,
        id_user: updated?.id_user ?? id,
        email: updated?.email ?? payload.email,
        nombre: form.nombre,
        apellidos: form.apellidos,
        tipodocumento: payload.person.type_identification,
        documento: String(payload.person.number_identification),
      }
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
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.documento}
          onChange={e=>{
            const v = e.target.value.replace(/\D+/g, '')
            setField('documento', v)
          }}
          required
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
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
