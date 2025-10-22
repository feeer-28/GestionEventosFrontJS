import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import { useToast } from '../../context/ToastContext'
import { AdminAPI } from '../../lib/api'
import TicketingForm from '../../components/TicketingForm'

export default function AdminTicketing() {
  const [eventos, setEventos] = useState([])
  const [localidades, setLocalidades] = useState([])
  const [eventoId, setEventoId] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { show } = useToast()

  useEffect(() => {
    async function loadAux() {
      try {
        const [evs, locs] = await Promise.all([
          AdminAPI.eventos(),
          AdminAPI.localidades(),
        ])
        setEventos(Array.isArray(evs) ? evs : [])
        setLocalidades(Array.isArray(locs) ? locs : [])
      } catch {}
    }
    loadAux()
  }, [])

  async function loadBoleteria(id) {
    if (!id) { setItems([]); return }
    setError('')
    setLoading(true)
    try {
      const data = await AdminAPI.boleteria(id)
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Error al cargar boletería')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (eventoId) loadBoleteria(eventoId) }, [eventoId])

  async function onRemove(item) {
    if (!confirm('¿Eliminar esta configuración de boletería?')) return
    try {
      await AdminAPI.eliminarBoleteria(item.idboleteria || item.id)
      show('Eliminado', 'success')
      await loadBoleteria(eventoId)
    } catch (err) {
      show(err.message || 'No se pudo eliminar', 'error')
    }
  }

  async function onSaveTicket(payload) {
    try {
      if (editing) {
        await AdminAPI.actualizarBoleteria(editing.idboleteria || editing.id, payload)
      } else {
        await AdminAPI.crearBoleteria(eventoId, payload)
      }
      setOpen(false)
      setEditing(null)
      await loadBoleteria(eventoId)
      show('Guardado', 'success')
    } catch (err) {
      show(err.message || 'No se pudo guardar', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <label className="block text-sm text-slate-600">Evento</label>
          <select value={eventoId} onChange={e=>setEventoId(e.target.value)} className="mt-1 w-full sm:w-80 rounded-lg border px-3 py-2">
            <option value="">Selecciona</option>
            {eventos.map(ev => (
              <option key={ev.ideventos || ev.id} value={ev.ideventos || ev.id}>
                {(ev.nombre_evento || ev.nombre) + ' (' + (ev.ideventos || ev.id) + ')'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button disabled={!eventoId} onClick={()=>{ setEditing(null); setOpen(true) }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
            <i className="bi bi-plus-lg" /> Agregar localidad
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2">Localidad</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.map(it => (
              <tr key={it.idboleteria || it.id} className="border-t">
                <td className="px-4 py-2">{it.localidad?.nombre || it.localidad_nombre || it.nombre_localidad || it.localidad_id}</td>
                <td className="px-4 py-2">{it.precio ?? it.valor}</td>
                <td className="px-4 py-2">{it.stock ?? it.cantidad}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{ setEditing(it); setOpen(true) }} className="p-2 rounded hover:bg-slate-100"><i className="bi bi-pencil" /></button>
                    <button onClick={()=>onRemove(it)} className="p-2 rounded hover:bg-slate-100 text-red-600"><i className="bi bi-x-circle" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && (
              <tr><td className="px-4 py-4" colSpan={4}>Cargando...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? 'Editar boletería' : 'Agregar boletería'} onClose={()=>{ setOpen(false); setEditing(null) }}>
        <TicketingForm initial={editing} localities={localidades} onClose={()=>{ setOpen(false); setEditing(null) }} onSaved={onSaveTicket} />
      </Modal>
    </div>
  )
}
