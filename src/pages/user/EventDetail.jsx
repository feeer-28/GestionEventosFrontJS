import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { EventoAPI } from '../../lib/api'

export default function EventDetail() {
  const { id } = useParams()
  const [evento, setEvento] = useState(null)
  const [tickets, setTickets] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setError('')
      setLoading(true)
      try {
        const detail = await EventoAPI.getDetail(id)
        setEvento(detail?.event || null)
        setTickets(Array.isArray(detail?.tickets) ? detail.tickets : [])
        setArtists(Array.isArray(detail?.artists) ? detail.artists : [])
      } catch (err) {
        setError(err.message || 'Error al cargar evento')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function fmt(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return isNaN(d) ? String(dateStr) : d.toLocaleDateString()
  }

  const title = evento?.name || evento?.nombre || 'Evento'
  const muni = evento?.municipio?.name || evento?.municipio?.nombre_municipio || ''
  const dept = evento?.municipio?.department?.name || ''
  const schedule = evento?.schedule || ''
  const start = fmt(evento?.date_start || evento?.fecha_inicio)
  const end = fmt(evento?.date_end || evento?.fecha_fin)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-4">
        {loading && <div>Cargando...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}

        {/* Detalle del evento */}
        {!loading && evento && (
          <div className="bg-white rounded-xl shadow p-4 space-y-2">
            <h2 className="text-2xl font-bold text-blue-900">{title}</h2>
            <div className="text-sm text-slate-700">{muni}{dept ? `, ${dept}` : ''}</div>
            <div className="text-sm text-slate-700">{start}{end ? ` - ${end}` : ''}{schedule ? ` · ${schedule}` : ''}</div>
            {evento.description && <p className="text-slate-700 mt-2">{evento.description}</p>}
          </div>
        )}

        {/* Tickets */}
        {!loading && tickets.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Boletas</h3>
            <div className="flex flex-wrap gap-2">
              {tickets.map(t => (
                <div key={t.id_ticket} className="rounded border px-3 py-2 text-sm">
                  <div className="font-medium">{t.locatedEvent?.name || 'General'}</div>
                  <div>Disponibles: {t.count}</div>
                  <div>Valor: ${Number(t.value || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artistas */}
        {!loading && artists.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Artistas</h3>
            <ul className="list-disc list-inside text-sm">
              {artists.map(a => (
                <li key={a.id_artist}>{`${a.name || ''} ${a.last_name || ''}`.trim()} {a.genderMusic?.name ? `· ${a.genderMusic.name}` : ''}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      
    </div>
  )
}
