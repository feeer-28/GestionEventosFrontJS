import { useEffect, useState } from 'react'
import { AdminAPI, CatalogAPI, ArtistAPI, MunicipioAPI, LocatedAPI, EventoAPI } from '../lib/api'

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
  const [localidades, setLocalidades] = useState([])
  const [tickets, setTickets] = useState([{ locatedEventId: '', value: '', count: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAux() {
      try {
        let munis = []
        let arts = []
        try {
          // Preferir backend Spring
          munis = await MunicipioAPI.list()
        } catch {}
        if (!Array.isArray(munis) || munis.length === 0) {
          // Fallback legacy
          munis = await CatalogAPI.municipios()
        }
        try {
          // Preferir backend Spring
          arts = await ArtistAPI.list()
        } catch {}
        if (!Array.isArray(arts) || arts.length === 0) {
          // Fallback legacy
          arts = await AdminAPI.artistas()
        }
        let locs = []
        try { locs = await LocatedAPI.list() } catch {}
        setMunicipios(Array.isArray(munis) ? munis : [])
        setArtistas(Array.isArray(arts) ? arts : [])
        setLocalidades(Array.isArray(locs) ? locs : [])
      } catch {}
    }
    loadAux()
  }, [])

  useEffect(() => {
    if (initial) {
      const toInput = (s) => {
        if (!s) return ''
        const d = new Date(s)
        if (isNaN(d.getTime())) return s
        const pad = (n) => String(n).padStart(2, '0')
        const y = d.getFullYear()
        const m = pad(d.getMonth() + 1)
        const day = pad(d.getDate())
        const hh = pad(d.getHours())
        const mm = pad(d.getMinutes())
        return `${y}-${m}-${day}T${hh}:${mm}`
      }
      const ev = initial.event || initial
      const id = initial.ideventos || initial.id || ev?.id || ''
      const name = initial.nombre_evento || initial.nombre || ev?.name || ''
      const desc = initial.descripcion || ev?.description || ''
      const ds = toInput(initial.fecha_inicio || ev?.date_start || '')
      const de = toInput(initial.fecha_fin || ev?.date_end || '')
      const st = typeof (initial.estado) !== 'undefined'
        ? initial.estado
        : (typeof ev?.status !== 'undefined' ? (Number(ev.status)===1?'activo':'inactivo') : 'activo')
      const muni = initial.municipio_idmunicipio
        || initial.municipio?.idmunicipio
        || ev?.municipio?.id_municipio
        || ''
      const artists = (initial.artistIds)
        ? initial.artistIds
        : (initial.artistas || ev?.artists || []).map(a => a.idartista || a.id || a)

      setForm({
        ideventos: id,
        nombre_evento: name,
        descripcion: desc,
        fecha_inicio: ds,
        fecha_fin: de,
        estado: st,
        total_asientos: initial.total_asientos || '',
        municipio_idmunicipio: muni,
        artistas: artists.map(Number),
      })

      const tks = (initial.tickets || []).map(t => ({
        locatedEventId: t.locatedEvent?.id_located_event || t.locatedEventId || t.id_located_event || '',
        value: t.value ?? '',
        count: t.count ?? '',
      }))
      if (tks.length > 0) setTickets(tks)
    }
  }, [initial])

  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const start = new Date(form.fecha_inicio)
      const end = new Date(form.fecha_fin)

      const isEdit = !!initial
      // Validaciones
      if (!isEdit) {
        if (!form.municipio_idmunicipio) throw new Error('Selecciona un municipio')
      }
      const ticketsValid = tickets.filter(t => t.locatedEventId && Number(t.value) > 0 && Number(t.count) > 0)
      if (!isEdit && ticketsValid.length === 0) throw new Error('Agrega al menos una boleta válida (localidad, valor y cantidad)')

      const toNoZ = (d) => {
        const pad = (n) => String(n).padStart(2, '0')
        const y = d.getFullYear()
        const m = pad(d.getMonth() + 1)
        const day = pad(d.getDate())
        const hh = pad(d.getHours())
        const mm = pad(d.getMinutes())
        const ss = pad(d.getSeconds())
        return `${y}-${m}-${day}T${hh}:${mm}:${ss}`
      }
      const scheduleRange = (() => {
        try {
          const sh = start.toTimeString().slice(0,5)
          const eh = end.toTimeString().slice(0,5)
          return `${sh}-${eh}`
        } catch { return undefined }
      })()
      const springEvent = {
        name: form.nombre_evento,
        description: form.descripcion,
        code: form.ideventos ? Number(form.ideventos) : undefined,
        status: form.estado === 'activo' ? 1 : 0,
        schedule: scheduleRange,
        date_start: isNaN(start.getTime()) ? undefined : toNoZ(start),
        date_end: isNaN(end.getTime()) ? undefined : toNoZ(end),
        municipio: form.municipio_idmunicipio ? { id_municipio: Number(form.municipio_idmunicipio) } : undefined,
      }
      const springPayload = { event: springEvent }
      if (!isEdit || ticketsValid.length > 0) {
        springPayload.tickets = ticketsValid.map(t => ({
          value: Number(t.value),
          count: Number(t.count),
          locatedEvent: { id_located_event: Number(t.locatedEventId) },
        }))
      }
      if (form.artistas && form.artistas.length > 0) {
        springPayload.artistIds = form.artistas.map(Number)
      }
      if (initial) {
        const updateId = initial.event?.id || initial.ideventos || initial.id || initial.event?.code || initial.code
        if (!updateId && updateId !== 0) throw new Error('Id de evento no válido para actualizar')
        await EventoAPI.update(updateId, springPayload)
      } else {
        await EventoAPI.create(springPayload)
      }
      onSaved?.()
    } catch (err) {
      if (err && err.status === 409) {
        setError((err.data?.message) || 'Conflicto de horario al asociar artistas con el evento')
      } else {
        setError(err.message || err.data?.message || 'Error al guardar')
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
          <input type="datetime-local" value={form.fecha_inicio} onChange={e=>setField('fecha_inicio', e.target.value)} required={!initial} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Fecha fin</label>
          <input type="datetime-local" value={form.fecha_fin} onChange={e=>setField('fecha_fin', e.target.value)} required={!initial} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Boletas por localidad</label>
        <div className="space-y-2">
          {tickets.map((t, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
              <select
                className="rounded border px-3 py-2"
                value={t.locatedEventId}
                onChange={e=>{
                  const v = e.target.value
                  setTickets(arr => arr.map((x,i)=> i===idx ? { ...x, locatedEventId: v } : x))
                }}
              >
                <option value="">Localidad</option>
                {localidades.map(l => {
                  const id = l.id_located_event || l.id || l.idlocalidad || l.idubicacion
                  const label = l.name || l.nombre || l.descripcion || `#${id}`
                  return <option key={id} value={id}>{label}</option>
                })}
              </select>
              <input type="number" className="rounded border px-3 py-2" placeholder="Valor"
                value={t.value}
                onChange={e=>{
                  const v = e.target.value
                  setTickets(arr => arr.map((x,i)=> i===idx ? { ...x, value: v } : x))
                }}
              />
              <input type="number" className="rounded border px-3 py-2" placeholder="Cantidad"
                value={t.count}
                onChange={e=>{
                  const v = e.target.value
                  setTickets(arr => arr.map((x,i)=> i===idx ? { ...x, count: v } : x))
                }}
              />
              <div className="flex gap-2">
                <button type="button" className="px-3 py-2 rounded border" onClick={()=>{
                  setTickets(arr => arr.filter((_,i)=> i!==idx))
                }}>Quitar</button>
                {idx === tickets.length - 1 && (
                  <button type="button" className="px-3 py-2 rounded border" onClick={()=>{
                    setTickets(arr => [...arr, { locatedEventId: '', value: '', count: '' }])
                  }}>Agregar</button>
                )}
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <button type="button" className="px-3 py-2 rounded border" onClick={()=> setTickets([{ locatedEventId: '', value: '', count: '' }])}>Agregar localidad</button>
          )}
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
          <input type="number" value={form.total_asientos} onChange={e=>setField('total_asientos', e.target.value)} required={!initial} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Municipio</label>
        <select value={form.municipio_idmunicipio} onChange={e=>setField('municipio_idmunicipio', e.target.value)} required={!initial} className="mt-1 w-full rounded-lg border px-3 py-2">
          <option value="">Selecciona</option>
          {municipios.map(m => {
            const id = m.idmunicipio || m.id_municipio || m.id
            const label = m.nombre_municipio || m.name || m.nombre || `#${id}`
            return <option key={id} value={id}>{label}</option>
          })}
        </select>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Artistas</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-auto p-1 border rounded-lg">
          {artistas.map(a => {
            const id = a.idartista || a.id || a.id_artist
            const name = a.nombre || a.name
            const checked = form.artistas.map(Number).includes(Number(id))
            return (
              <label key={id} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={checked} onChange={e=>{
                  setForm(p=> ({
                    ...p,
                    artistas: e.target.checked
                      ? Array.from(new Set([...p.artistas.map(Number), Number(id)]))
                      : p.artistas.filter(x=>Number(x)!==Number(id))
                  }))
                }} />
                {name}
              </label>
            )
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
