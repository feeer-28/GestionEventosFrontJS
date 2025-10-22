import { useEffect, useState } from 'react'
import { AdminAPI } from '../../lib/api'
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
      const data = await AdminAPI.eventos()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onDeactivate(e) {
    if (!confirm('¿Desactivar este evento?')) return
    try {
      await AdminAPI.desactivarEvento(e.ideventos || e.id)
      show('Evento desactivado', 'success')
      await load()
    } catch (err) {
      show(err.message || 'No se pudo desactivar', 'error')
    }
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
            {!loading && items.map(e => (
              <tr key={e.ideventos || e.id} className="border-t">
                <td className="px-4 py-2">{e.nombre_evento || e.nombre}</td>
                <td className="px-4 py-2">{e.fecha_inicio || ''}</td>
                <td className="px-4 py-2">{e.fecha_fin || ''}</td>
                <td className="px-4 py-2 capitalize">{e.estado || ''}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{ setEditing(e); setOpen(true) }} className="p-2 rounded hover:bg-slate-100"><i className="bi bi-pencil" /></button>
                    <button onClick={()=>onDeactivate(e)} className="p-2 rounded hover:bg-slate-100 text-red-600"><i className="bi bi-x-circle" /></button>
                  </div>
                </td>
              </tr>
            ))}
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
