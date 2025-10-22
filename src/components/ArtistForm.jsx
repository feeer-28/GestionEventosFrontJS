import { useEffect, useState } from 'react'
import { AdminAPI } from '../lib/api'

export default function ArtistForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    idartista: '',
    nombre: '',
    apellidos: '',
    ciudad: '',
    estado: 'activo',
    genero_musical_idgenero_musical: '',
  })
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAux() {
      try {
        const gens = await (await import('../lib/api')).CatalogAPI.generos()
        setGeneros(Array.isArray(gens) ? gens : [])
      } catch {}
    }
    loadAux()
  }, [])

  useEffect(() => {
    if (initial) {
      setForm({
        idartista: initial.idartista || initial.id || '',
        nombre: initial.nombre || '',
        apellidos: initial.apellidos || '',
        ciudad: initial.ciudad || '',
        estado: initial.estado || 'activo',
        genero_musical_idgenero_musical: initial.genero_musical_idgenero_musical || initial.genero_musical?.idgenero_musical || '',
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
        idartista: form.idartista ? Number(form.idartista) : undefined,
        nombre: form.nombre,
        apellidos: form.apellidos,
        ciudad: form.ciudad,
        estado: form.estado,
        genero_musical_idgenero_musical: Number(form.genero_musical_idgenero_musical),
      }
      if (initial) {
        await AdminAPI.actualizarArtista(initial.idartista || initial.id, payload)
      } else {
        await AdminAPI.crearArtista(payload)
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
          <label className="block text-sm text-slate-600">ID Artista</label>
          <input value={form.idartista} onChange={e=>setField('idartista', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="10" />
        </div>
      )}
      <div>
        <label className="block text-sm text-slate-600">Nombre</label>
        <input value={form.nombre} onChange={e=>setField('nombre', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Apellidos</label>
        <input value={form.apellidos} onChange={e=>setField('apellidos', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600">Ciudad</label>
          <input value={form.ciudad} onChange={e=>setField('ciudad', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Estado</label>
          <select value={form.estado} onChange={e=>setField('estado', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Género musical</label>
        <select value={form.genero_musical_idgenero_musical} onChange={e=>setField('genero_musical_idgenero_musical', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2">
          <option value="">Selecciona</option>
          {generos.map(g => (
            <option key={g.idgenero_musical} value={g.idgenero_musical}>{g.nombre_genero}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
