import { useEffect, useState } from 'react'
import { AdminAPI, CatalogAPI } from '../lib/api'

export default function EventForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    ideventos: '',
    nombre_evento: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo',
    total_asientos: '',
    municipio_idmunicipio: '',
    artistas: [],
  })
  const [municipios, setMunicipios] = useState([])
  const [artistas, setArtistas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAux() {
      try {
        const [munis, arts] = await Promise.all([
          CatalogAPI.municipios(),
          AdminAPI.artistas(),
        ])
        setMunicipios(Array.isArray(munis) ? munis : [])
        setArtistas(Array.isArray(arts) ? arts : [])
      } catch {}
    }
    loadAux()
  }, [])

  useEffect(() => {
    if (initial) {
      setForm({
        ideventos: initial.ideventos || initial.id || '',
        nombre_evento: initial.nombre_evento || initial.nombre || '',
        descripcion: initial.descripcion || '',
        fecha_inicio: initial.fecha_inicio || '',
        fecha_fin: initial.fecha_fin || '',
        estado: initial.estado || 'activo',
        total_asientos: initial.total_asientos || '',
        municipio_idmunicipio: initial.municipio_idmunicipio || initial.municipio?.idmunicipio || '',
        artistas: (initial.artistas || []).map(a => a.idartista || a),
      })
    }
  }, [initial])

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const all = await AdminAPI.eventos()
      const eventos = Array.isArray(all) ? all : []
      const start = new Date(form.fecha_inicio)
      const end = new Date(form.fecha_fin)
      const currentId = initial ? (initial.ideventos || initial.id) : null
      const selectedArtists = new Set(form.artistas.map(Number))
      const conflict = eventos.find(ev => {
        const evId = ev.ideventos || ev.id
        if (currentId && evId === currentId) return false
        const evStart = new Date(ev.fecha_inicio)
        const evEnd = new Date(ev.fecha_fin)
        const overlap = start < evEnd && end > evStart
        if (!overlap) return false
        const evArtists = (ev.artistas || []).map(a => a.idartista || a).map(Number)
        return evArtists.some(a => selectedArtists.has(a))
      })
      if (conflict) {
        setError('Conflicto de horario: uno o más artistas ya están asignados a otro evento en ese rango de tiempo')
        setLoading(false)
        return
      }
      const payload = {
        ideventos: form.ideventos ? Number(form.ideventos) : undefined,
        nombre_evento: form.nombre_evento,
        descripcion: form.descripcion,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        estado: form.estado,
        total_asientos: Number(form.total_asientos),
        municipio_idmunicipio: Number(form.municipio_idmunicipio),
        artistas: form.artistas.map(Number),
      }
      if (initial) {
        await AdminAPI.actualizarEvento(initial.ideventos || initial.id, payload)
      } else {
        await AdminAPI.crearEvento(payload)
      }
      onSaved?.()
    } catch (err) {
      if (err && err.status === 409) {
        setError((err.data?.message) || 'Conflicto de horario al asociar artistas con el evento')
      } else {
        setError(err.message || 'Error al guardar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!initial && (
        <div>
          <label className="block text-sm text-slate-600">ID Evento</label>
          <input value={form.ideventos} onChange={e=>setField('ideventos', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="100" />
        </div>
      )}
      <div>
        <label className="block text-sm text-slate-600">Nombre</label>
        <input value={form.nombre_evento} onChange={e=>setField('nombre_evento', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Descripción</label>
        <textarea value={form.descripcion} onChange={e=>setField('descripcion', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600">Fecha inicio</label>
          <input type="datetime-local" value={form.fecha_inicio} onChange={e=>setField('fecha_inicio', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Fecha fin</label>
          <input type="datetime-local" value={form.fecha_fin} onChange={e=>setField('fecha_fin', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600">Estado</label>
          <select value={form.estado} onChange={e=>setField('estado', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-600">Total asientos</label>
          <input type="number" value={form.total_asientos} onChange={e=>setField('total_asientos', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Municipio</label>
        <select value={form.municipio_idmunicipio} onChange={e=>setField('municipio_idmunicipio', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2">
          <option value="">Selecciona</option>
          {municipios.map(m => (
            <option key={m.idmunicipio} value={m.idmunicipio}>{m.nombre_municipio}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Artistas</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-auto p-1 border rounded-lg">
          {artistas.map(a => (
            <label key={a.idartista} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.artistas.includes(a.idartista)} onChange={e=>{
                setForm(p=> ({...p, artistas: e.target.checked ? [...p.artistas, a.idartista] : p.artistas.filter(x=>x!==a.idartista)}))
              }} />
              {a.nombre}
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
