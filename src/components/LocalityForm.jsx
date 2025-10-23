import { useEffect, useState } from 'react'
import { LocatedAPI } from '../lib/api'

export default function LocalityForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ codigo: '', nombre: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        codigo: String((initial.code ?? initial.codigo ?? initial.id ?? initial.idlocalidad) || ''),
        nombre: (initial.name ?? initial.nombre ?? initial.nombre_localidad) || '',
      })
    }
  }, [initial])

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        code: String(form.codigo),
        name: form.nombre,
        description: form.nombre || '',
        status: 1,
      }
      if (initial) {
        const updateId = (initial._id ?? initial.id ?? initial.idlocalidad ?? initial.idLocatedEvent ?? initial.locatedEventId ?? initial.id_located_event)
        if (updateId == null) throw new Error('No se encontró el ID de la localidad para actualizar')
        await LocatedAPI.actualizarLocalidad(updateId, payload)
      } else {
        await LocatedAPI.create(payload)
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
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-700 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
