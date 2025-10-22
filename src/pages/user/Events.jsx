import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CatalogAPI, UserAPI } from '../../lib/api'

export default function UserEvents() {
  const [filters, setFilters] = useState({ depto: '', muni: '', fecha: '' })
  const [items, setItems] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [municipios, setMunicipios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [artistsByEvent, setArtistsByEvent] = useState({}) // id -> string[]
  const [availByEvent, setAvailByEvent] = useState({}) // id -> { [localidad]: count }

  useEffect(() => {
    async function init() {
      try {
        const [deps, munis] = await Promise.all([
          CatalogAPI.departamentos(),
          CatalogAPI.municipios(),
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
        const params = new URLSearchParams()
        if (filters.depto) params.append('departamento_id', filters.depto)
        if (filters.muni) params.append('municipio_id', filters.muni)
        if (filters.fecha) params.append('fecha', filters.fecha)
        const data = await UserAPI.eventos(params.toString() ? `?${params.toString()}` : '')
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Error al cargar eventos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filters.depto, filters.muni, filters.fecha])

  useEffect(() => {
    async function enrich() {
      const ids = (items || []).map(e => e.ideventos || e.id)
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select value={filters.depto} onChange={e=>setFilters(p=>({...p, depto: e.target.value, muni: ''}))} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Departamento</option>
          {departamentos.map(d => (
            <option key={d.iddepartamento} value={d.iddepartamento}>{d.nombre_departamento}</option>
          ))}
        </select>
        <select value={filters.muni} onChange={e=>setFilters(p=>({...p, muni: e.target.value}))} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Municipio</option>
          {municipios.filter(m => !filters.depto || m.departamento_iddepartamento == filters.depto).map(m => (
            <option key={m.idmunicipio} value={m.idmunicipio}>{m.nombre_municipio}</option>
          ))}
        </select>
        <input type="date" value={filters.fecha} onChange={e=>setFilters(p=>({...p, fecha: e.target.value}))} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && list.map(e => (
          <Link key={e.ideventos || e.id} to={`/user/events/${e.ideventos || e.id}`} className="bg-white rounded-xl shadow hover:shadow-md transition p-4 hover:ring-2 hover:ring-purple-300">
            <div className="font-semibold">{e.nombre_evento || e.nombre}</div>
            <div className="text-sm text-slate-600">{e.municipio?.nombre_municipio || ''}</div>
            <div className="text-sm text-slate-600">{e.fecha_inicio}{e.fecha_fin ? ` - ${e.fecha_fin}` : ''}</div>
            {Array.isArray(artistsByEvent[e.ideventos || e.id]) && artistsByEvent[e.ideventos || e.id].length > 0 && (
              <div className="mt-2 text-sm"><span className="font-medium text-blue-900">Artistas:</span> {artistsByEvent[e.ideventos || e.id].join(', ')}</div>
            )}
            {availByEvent[e.ideventos || e.id] && Object.keys(availByEvent[e.ideventos || e.id]).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(availByEvent[e.ideventos || e.id]).map(([loc, cnt]) => (
                  <span key={loc} className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-800 px-2 py-1 text-xs">
                    <i className="bi bi-ticket-perforated" /> {loc}: {cnt}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
        {loading && (<div className="col-span-full text-slate-600">Cargando...</div>)}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  )
}
