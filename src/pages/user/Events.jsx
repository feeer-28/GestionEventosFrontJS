import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EventoAPI, MunicipioAPI, DepartmentAPI, UserAPI } from '../../lib/api'
import Modal from '../../components/Modal'
import EventDetail from './EventDetail'
import EventDetailLanding from './EventDatailLanding'

export default function UserEvents() {
  const [filters, setFilters] = useState({ depto: '', muni: '', search: '', start: '', end: '' })
  const [items, setItems] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [artistsByEvent, setArtistsByEvent] = useState({}) // id -> string[]
  const [availByEvent, setAvailByEvent] = useState({}) // id -> { [localidad]: count }
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        const [deps, munis] = await Promise.all([
          DepartmentAPI.list(),
          MunicipioAPI.list(),
        ])
        setDepartamentos(Array.isArray(deps) ? deps : [])
        setMunicipios(Array.isArray(munis) ? munis : [])
      } catch {}
    }
    init()
  }, [])

  useEffect(() => {
    async function load() {
      setError('')
      setLoading(true)
      try {
        const data = await EventoAPI.list({
          // Backend espera estos nombres exactos:
          ...(filters.muni ? { municipioId: Number(filters.muni) } : {}),
          ...(filters.depto ? { departmentId: Number(filters.depto) } : {}),
          ...(filters.search ? { filter: filters.search } : {}),
          ...(filters.start ? { startDate: filters.start } : {}),
          ...(filters.end ? { endDate: filters.end } : {}),
        })
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Error al cargar eventos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filters.depto, filters.muni, filters.search, filters.start, filters.end])

  useEffect(() => {
    async function enrich() {
      const ids = (items || []).map(e => e.id_event || e.ideventos || e.id)
      if (!ids.length) { setArtistsByEvent({}); setAvailByEvent({}); return }
      try {
        const artistPromises = ids.map(async id => {
          try {
            const ev = await UserAPI.evento(id)
            const names = Array.isArray(ev?.artistas) ? ev.artistas.map(a => `${a.nombres} ${a.apellidos}`.trim()) : []
            return [id, names]
          } catch { return [id, []] }
        })
        const availPromises = ids.map(async id => {
          try {
            const seats = await UserAPI.asientosEvento(id)
            const map = {}
            if (Array.isArray(seats)) {
              for (const s of seats) {
                const loc = s.nombre_localidad || s.localidad || s.localidad_nombre
                if (!loc) continue
                if (s.estado === 'disponible') map[loc] = (map[loc] || 0) + 1
              }
            }
            return [id, map]
          } catch { return [id, {}] }
        })
        const artistsEntries = await Promise.all(artistPromises)
        const availEntries = await Promise.all(availPromises)
        setArtistsByEvent(Object.fromEntries(artistsEntries))
        setAvailByEvent(Object.fromEntries(availEntries))
      } catch {}
    }
    enrich()
  }, [items])

  const list = useMemo(() => items, [items])
  const hasSession = useMemo(() => {
    try { return !!JSON.parse(localStorage.getItem('user')||'null') } catch { return false }
  }, [])

  function openEvent(id) {
    setSelectedId(id)
    setModalOpen(true)
  }

  function fmt(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d)) return String(dateStr)
    return d.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input
          type="text"
          value={filters.search}
          onChange={e=>setFilters(p=>({...p, search: e.target.value }))}
          placeholder="Buscar eventos..."
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-1 sm:col-span-2"
        />
        <select value={filters.depto} onChange={e=>setFilters(p=>({...p, depto: e.target.value, muni: ''}))} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Departamento</option>
          {departamentos.map(d => (
            <option key={d.id_department || d.iddepartamento} value={d.id_department || d.iddepartamento}>{d.name || d.nombre_departamento}</option>
          ))}
        </select>
        <select value={filters.muni} onChange={e=>setFilters(p=>({...p, muni: e.target.value}))} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Municipio</option>
          {municipios.filter(m => !filters.depto || (m.department?.id_department || m.departamento_iddepartamento) == filters.depto).map(m => (
            <option key={m.id_municipio || m.idmunicipio} value={m.id_municipio || m.idmunicipio}>{m.name || m.nombre_municipio}</option>
          ))}
        </select>
        <input type="date" value={filters.start} onChange={e=>setFilters(p=>({...p, start: e.target.value}))} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        <input type="date" value={filters.end} onChange={e=>setFilters(p=>({...p, end: e.target.value}))} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && list.map(e => {
          const id = e.id_event || e.ideventos || e.id
          const title = e.name || e.nombre_evento || e.nombre
          const muni = e.municipio?.name || e.municipio?.nombre_municipio || ''
          const dept = e.municipio?.department?.name || ''
          const start = fmt(e.date_start || e.fecha_inicio)
          const end = fmt(e.date_end || e.fecha_fin)
          const schedule = e.schedule || ''
          return (
          <div key={id} onClick={()=>openEvent(id)} className="cursor-pointer bg-white rounded-xl shadow hover:shadow-md transition p-4 hover:ring-2 hover:ring-purple-300">
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-slate-600">{muni}{dept ? `, ${dept}` : ''}</div>
            <div className="text-sm text-slate-600">{start}{end ? ` - ${end}` : ''}{schedule ? ` · ${schedule}` : ''}</div>
            {Array.isArray(artistsByEvent[id]) && artistsByEvent[id].length > 0 && (
              <div className="mt-2 text-sm"><span className="font-medium text-blue-900">Artistas:</span> {artistsByEvent[e.ideventos || e.id].join(', ')}</div>
            )}
            {availByEvent[id] && Object.keys(availByEvent[id]).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(availByEvent[id]).map(([loc, cnt]) => (
                  <span key={loc} className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-800 px-2 py-1 text-xs">
                    <i className="bi bi-ticket-perforated" /> {loc}: {cnt}
                  </span>
                ))}
              </div>
            )}
          </div>
        )})}
        {loading && (<div className="col-span-full text-slate-600">Cargando...</div>)}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Modal open={modalOpen} title="Detalle de evento" onClose={()=>setModalOpen(false)}>
        {selectedId && (
          hasSession ? (
            <EventDetail eventId={selectedId} />
          ) : (
            <EventDetailLanding eventId={selectedId} />
          )
        )}
      </Modal>
    </div>
  )
}
