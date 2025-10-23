import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { EventoAPI } from '../../lib/api'

export default function EventDetail() {
  const { id: idParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const id = idParam && idParam !== 'undefined' ? idParam : (location.state?.id ?? '')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setError('')
      setLoading(true)
      try {
        if (!id) throw new Error('Id de evento no válido')
        const data = await EventoAPI.getDetail(id)
        setDetail(data)
      } catch (err) {
        setError(err.message || 'Error al cargar evento')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])
  const ev = detail?.event || detail || {}
  const tickets = Array.isArray(detail?.tickets) ? detail.tickets : []
  const artists = detail?.artistIds || detail?.artists || []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-start">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded border text-blue-900 hover:bg-slate-50">
          <i className="bi bi-arrow-left" /> Regresar
        </button>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        {loading && <div className="text-slate-600">Cargando...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && !error && (
          <>
            <div className="text-2xl font-bold text-blue-900">{ev.name || ev.nombre_evento || 'Evento'}</div>
            <div className="text-slate-600">{ev.description || ''}</div>
            <div className="text-slate-600">{(ev.date_start || '')}{ev.date_end ? ` - ${ev.date_end}` : ''}</div>
            <div className="text-slate-600">Estado: {typeof ev.status !== 'undefined' ? (Number(ev.status)===1?'activo':'inactivo') : ''}</div>
            <div className="text-slate-600">Horario: {ev.schedule || 'N/D'}</div>
            <div className="text-slate-600">Municipio: {ev.municipio?.nombre || ev.municipio?.name || `#${ev.municipio?.id_municipio ?? ''}`}</div>
          </>
        )}
      </div>

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="font-semibold">Artistas</div>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(artists) ? artists : []).map((a, i) => {
              const id = a.id || a.idartista || a
              const name = a.name || a.nombre || `Artista #${id}`
              return <span key={`${id}-${i}`} className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-sm">{name}</span>
            })}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold mb-2">Boletas por localidad</div>
          {tickets.length === 0 ? (
            <div className="text-slate-600">Sin boletas registradas</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2">Localidad</th>
                    <th className="px-4 py-2">Valor</th>
                    <th className="px-4 py-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{t.locatedEvent?.name || t.locatedEvent?.nombre || `#${t.locatedEvent?.id_located_event ?? ''}`}</td>
                      <td className="px-4 py-2">${t.value}</td>
                      <td className="px-4 py-2">{t.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
