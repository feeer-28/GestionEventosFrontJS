import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EventoAPI } from '../../lib/api'
import Modal from '../../components/Modal'
import EventForm from '../../components/EventForm'
import { useToast } from '../../context/ToastContext'

export default function AdminEvents() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { show } = useToast()

  async function load() {
    setError('')
    setLoading(true)
    try {
      const data = await EventoAPI.list()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }

  async function onActivate(e) {
    const id = e.ideventos || e.id || e.event?.id || e.idEvent || e.eventId || e.id_event || e.idevento || e.code || e.event?.code
    if (!id && id !== 0) { show('No se encontró el identificador del evento', 'error'); return }
    try {
      await EventoAPI.setStatus(id, 1)
      show('Evento activado', 'success')
      await load()
    } catch (err) {
      show(err.message || 'No se pudo activar', 'error')
    }
  }

  useEffect(() => { load() }, [])

  async function onDeactivate(e) {
    if (!confirm('¿Desactivar este evento?')) return
    const id = e.ideventos || e.id || e.event?.id || e.idEvent || e.eventId || e.id_event || e.idevento || e.code || e.event?.code
    if (!id && id !== 0) { show('No se encontró el identificador del evento', 'error'); return }
    try {
      await EventoAPI.setStatus(id, 0)
      show('Evento desactivado', 'success')
      await load()
    } catch (err) {
      show(err.message || 'No se pudo desactivar', 'error')
    }
  }

  async function onEditClick(e) {
    const id = e.ideventos || e.id || e.event?.id || e.idEvent || e.eventId || e.id_event || e.idevento || e.code || e.event?.code
    try {
      const detail = await EventoAPI.getDetail(id)
      setEditing(detail || e)
    } catch {
      setEditing(e)
    }
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Eventos</h2>
        <button onClick={()=>{ setEditing(null); setOpen(true) }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
          <i className="bi bi-plus-lg" /> Crear
        </button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Fecha inicio</th>
              <th className="px-4 py-2">Fecha fin</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.map((e, idx) => {
              const id = e.ideventos || e.id || e.event?.id || e.idEvent || e.eventId || e.id_event || e.idevento || e.code || e.codigo
              return (
              <tr key={`${id ?? idx}-${idx}`} className="border-t">
                <td className="px-4 py-2">
                  {id ? (
                    <Link className="hover:underline text-blue-700" to={`/admin/events/${id}`} state={{ id }}>
                      {e.nombre_evento || e.nombre || e.name || e.event?.name || ''}
                    </Link>
                  ) : (
                    <span>{e.nombre_evento || e.nombre || e.name || e.event?.name || ''}</span>
                  )}
                </td>
                <td className="px-4 py-2">{e.fecha_inicio || e.date_start || e.event?.date_start || ''}</td>
                <td className="px-4 py-2">{e.fecha_fin || e.date_end || e.event?.date_end || ''}</td>
                <td className="px-4 py-2 capitalize">{e.estado || (typeof e.status !== 'undefined' ? (Number(e.status)===1?'activo':'inactivo') : '')}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button onClick={()=> onEditClick(e)} className="p-2 rounded hover:bg-slate-100" title="Editar"><i className="bi bi-pencil" /></button>
                    {id && <Link to={`/admin/events/${id}`} state={{ id }} className="p-2 rounded hover:bg-slate-100" title="Ver detalle"><i className="bi bi-eye" /></Link>}
                    {(e.estado?.toLowerCase?.() === 'inactivo' || Number(e.status) === 0) ? (
                      <button onClick={()=>onActivate(e)} className="p-2 rounded hover:bg-slate-100 text-emerald-600" title="Activar"><i className="bi bi-check-circle" /></button>
                    ) : (
                      <button onClick={()=>onDeactivate(e)} className="p-2 rounded hover:bg-slate-100 text-red-600" title="Desactivar"><i className="bi bi-x-circle" /></button>
                    )}
                  </div>
                </td>
              </tr>
            )})}
            {loading && (
              <tr><td className="px-4 py-4" colSpan={5}>Cargando...</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal open={open} title={editing ? 'Editar evento' : 'Crear evento'} onClose={()=>setOpen(false)}>
        <EventForm initial={editing} onClose={()=>setOpen(false)} onSaved={()=>{ setOpen(false); load() }} />
      </Modal>
    </div>
  )
}
