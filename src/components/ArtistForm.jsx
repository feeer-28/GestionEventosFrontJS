import { useEffect, useState } from 'react'
import { AdminAPI, ArtistAPI } from '../lib/api'

export default function ArtistForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    idartista: '',
    nombre: '',
    apellidos: '',
    ciudad: '',
    estado: 'activo',
    genero_musical_idgenero_musical: '',
    codigo: '',
  })
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAux() {
      try {
        // Intentar primero el backend Spring
        let gens = []
        try {
          gens = await ArtistAPI.genders()
        } catch {
          // Fallback al catálogo existente
          gens = await (await import('../lib/api')).CatalogAPI.generos()
        }
        setGeneros(Array.isArray(gens) ? gens : [])
      } catch {}
    }
    loadAux()
  }, [])

  useEffect(() => {
    if (initial) {
      setForm({
        idartista: initial.idartista || initial.id || initial.id_artist || '',
        nombre: initial.nombre || initial.name || '',
        apellidos: initial.apellidos || initial.last_name || '',
        ciudad: initial.ciudad || initial.origen_city || '',
        estado: typeof initial.status === 'number' ? (initial.status === 1 ? 'activo' : 'inactivo') : (initial.estado || 'activo'),
        genero_musical_idgenero_musical: initial.genero_musical_idgenero_musical || initial.genero_musical?.idgenero_musical || initial.genderMusic?.id_genderMusic || '',
      })
    }
  }, [initial])

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (initial) {
        // Editar contra backend Spring: enviar entidad completa (merge initial + cambios)
        const mergedPayload = {
          name: form.nombre !== undefined && form.nombre !== '' ? form.nombre : (initial.name || initial.nombre || ''),
          last_name: form.apellidos !== undefined && form.apellidos !== '' ? form.apellidos : (initial.last_name || initial.apellidos || ''),
          origen_city: form.ciudad !== undefined && form.ciudad !== '' ? form.ciudad : (initial.origen_city || initial.ciudad || ''),
          code: (form.codigo && form.codigo !== '') ? form.codigo : (initial.code || initial.codigo || ''),
          status: form.estado ? (form.estado === 'activo' ? 1 : 0) : (typeof initial.status === 'number' ? initial.status : (initial.estado === 'inactivo' ? 0 : 1)),
          genderMusic: {
            id_genderMusic: Number(form.genero_musical_idgenero_musical || initial.genderMusic?.id_genderMusic || initial.genero_musical?.idgenero_musical || initial.genero_musical_idgenero_musical || 0),
          },
        }
        await ArtistAPI.update(initial.idartista || initial.id || initial.id_artist, mergedPayload)
      } else {
        // Crear contra backend Spring
        const springPayload = {
          name: form.nombre,
          last_name: form.apellidos,
          origen_city: form.ciudad,
          code: form.codigo,
          status: form.estado === 'activo' ? 1 : 0,
          genderMusic: { id_genderMusic: Number(form.genero_musical_idgenero_musical) },
        }
        await ArtistAPI.create(springPayload)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-600">Código</label>
            <input value={form.codigo} onChange={e=>setField('codigo', e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="JP01" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">ID Artista (opcional)</label>
            <input value={form.idartista} onChange={e=>setField('idartista', e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="(auto)" />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm text-slate-600">Nombre</label>
        <input value={form.nombre} onChange={e=>setField('nombre', e.target.value)} required={!initial} className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm text-slate-600">Apellidos</label>
        <input value={form.apellidos} onChange={e=>setField('apellidos', e.target.value)} required={!initial} className="mt-1 w-full rounded-lg border px-3 py-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600">Ciudad</label>
          <input value={form.ciudad} onChange={e=>setField('ciudad', e.target.value)} required={!initial} className="mt-1 w-full rounded-lg border px-3 py-2" />
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
        <select value={form.genero_musical_idgenero_musical} onChange={e=>setField('genero_musical_idgenero_musical', e.target.value)} required={!initial} className="mt-1 w-full rounded-lg border px-3 py-2">
          <option value="">Selecciona</option>
          {generos.map(g => {
            const id = g.idgenero_musical || g.id_genderMusic || g.id
            const label = g.nombre_genero || g.name || g.nombre || g.descripcion || `#${id}`
            return <option key={id} value={id}>{label}</option>
          })}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
