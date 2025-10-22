import { useEffect, useState } from 'react'
import { AdminAPI } from '../lib/api'

export default function LocalityForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ codigo: '', nombre: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        codigo: String(initial.idlocalidad || initial.id || initial.codigo || ''),
        nombre: initial.nombre_localidad || initial.nombre || '',
      })
    }
  }, [initial])

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { codigo: Number(form.codigo), nombre: form.nombre }
      if (initial) {
        await AdminAPI.actualizarLocalidad(initial.idlocalidad || initial.id || initial.codigo, payload)
      } else {
        await AdminAPI.crearLocalidad(payload)
      }
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!initial && (
        <div>
          <label className="block text-sm text-slate-600">Código de localidad</label>
          <input value={form.codigo} onChange={e=>setField('codigo', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="101" />
        </div>
      )}
      <div>
        <label className="block text-sm text-slate-600">Nombre de localidad</label>
        <input value={form.nombre} onChange={e=>setField('nombre', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
