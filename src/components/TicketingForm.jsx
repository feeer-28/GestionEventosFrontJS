import { useEffect, useState } from 'react'

export default function TicketingForm({ initial, localities, onClose, onSaved }) {
  const [form, setForm] = useState({ localidad_id: '', precio: '', stock: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        localidad_id: String(initial.localidad_id || initial.localidad?.id || initial.idlocalidad || ''),
        precio: String(initial.precio || initial.valor || ''),
        stock: String(initial.stock || initial.cantidad || ''),
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
        localidad_id: Number(form.localidad_id),
        precio: Number(form.precio),
        stock: Number(form.stock),
      }
      onSaved?.(payload)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div>
        <label className="block text-sm text-slate-600">Localidad</label>
        <select value={form.localidad_id} onChange={e=>setField('localidad_id', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2">
          <option value="">Selecciona</option>
          {localities.map(l => (
            <option key={l.idlocalidad || l.id || l.codigo} value={l.idlocalidad || l.id || l.codigo}>
              {(l.nombre_localidad || l.nombre) + ' (' + (l.idlocalidad || l.id || l.codigo) + ')'}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600">Precio</label>
          <input type="number" step="0.01" value={form.precio} onChange={e=>setField('precio', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Cantidad disponible</label>
          <input type="number" value={form.stock} onChange={e=>setField('stock', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
