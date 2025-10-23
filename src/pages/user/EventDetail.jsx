import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import { EventoAPI, PaymentMethodAPI, TicketAPI, BuyoutAPI } from '../../lib/api'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [tickets, setTickets] = useState([])
  const [artists, setArtists] = useState([])
  const [methods, setMethods] = useState([])
  const [allTickets, setAllTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ticket_number: 1, methodId: '', ticketId: '', bank: '' })
  const [successOpen, setSuccessOpen] = useState(false)

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

  // Cargar métodos de pago y tickets
  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [pm, tk] = await Promise.all([
          PaymentMethodAPI.list(),
          TicketAPI.list(),
        ])
        setMethods(Array.isArray(pm) ? pm : [])
        setAllTickets(Array.isArray(tk) ? tk : [])
      } catch {}
    }
    loadCatalogs()
  }, [])

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

  const relatedTickets = Array.isArray(allTickets)
    ? allTickets.filter(t => (t.event?.id_event || t.event?.id || t.evento_id) == (evento?.id_event || evento?.id))
    : []

  async function onBuy(e) {
    e.preventDefault()
    setError('')
    if (!form.methodId) { setError('Selecciona un método de pago'); return }
    if (!form.ticketId) { setError('Selecciona un ticket'); return }
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const userId = user?.id_user || user?.id || user?.idusuario
    if (!userId) { setError('Inicia sesión para comprar'); return }
    const body = {
      ticket_number: Number(form.ticket_number) || 1,
      state_pay: 1,
      payMethod: { id_pay_method: Number(form.methodId) },
      user: { id_user: Number(userId) },
      ticket: { id_ticket: Number(form.ticketId) },
    }
    setSubmitting(true)
    try {
      await BuyoutAPI.create(body)
      setSuccessOpen(true)
    } catch (err) {
      setError(err.message || 'No se pudo completar la compra')
    } finally {
      setSubmitting(false)
    }
  }

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

      {/* Formulario de compra */}
      {!loading && evento && (
        <form onSubmit={onBuy} className="bg-white rounded-xl shadow p-4 space-y-3">
          <h3 className="text-lg font-semibold">Comprar boletas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-sm text-slate-600">Ticket</label>
              <select value={form.ticketId} onChange={e=>setForm(p=>({...p, ticketId: e.target.value}))} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">Selecciona ticket</option>
                {relatedTickets.map(t => (
                  <option key={t.id_ticket} value={t.id_ticket}>{t.locatedEvent?.name || 'General'} · ${Number(t.value||0).toLocaleString()} · Disp: {t.count}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600">Cantidad</label>
              <input type="number" min={1} max={10} value={form.ticket_number} onChange={e=>setForm(p=>({...p, ticket_number: e.target.value}))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Método de pago</label>
              <select value={form.methodId} onChange={e=>setForm(p=>({...p, methodId: e.target.value}))} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">Selecciona método</option>
                {methods.map(m => (
                  <option key={m.id_pay_method || m.idmetodo_pago} value={m.id_pay_method || m.idmetodo_pago}>{m.type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600">Cuenta bancaria</label>
              <input type="text" value={form.bank} onChange={e=>setForm(p=>({...p, bank: e.target.value}))} placeholder="Ingrese cuenta bancaria" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={submitting} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white">
              {submitting ? 'Procesando...' : 'Comprar'}
            </button>
          </div>
        </form>
      )}
      
      {/* Modal de éxito */}
      <Modal open={successOpen} title="Compra exitosa" onClose={()=>{}} disableBackdropClose hideClose>
        <div className="space-y-3">
          <p>Tu compra se realizó correctamente.</p>
          <button onClick={()=>navigate('/user/events', { replace: true })} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white">
            Volver
          </button>
        </div>
      </Modal>

    </div>
  )
}
