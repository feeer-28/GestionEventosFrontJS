import { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import { useToast } from '../../context/ToastContext'
import { AdminAPI } from '../../lib/api'
import LocalityForm from '../../components/LocalityForm'

export default function AdminLocalities() {
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
      const data = await AdminAPI.localidades()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Error al cargar localidades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onDeactivate(item) {
    if (!confirm('¿Desactivar esta localidad?')) return
    try {
      await AdminAPI.desactivarLocalidad(item.idlocalidad || item.id || item.codigo)
      show('Localidad desactivada', 'success')
      await load()
    } catch (err) {
      show(err.message || 'No se pudo desactivar', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Localidades</h2>
        <button onClick={()=>{ setEditing(null); setOpen(true) }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
          <i className="bi bi-plus-lg" /> Crear
        </button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.map(l => (
              <tr key={l.idlocalidad || l.id || l.codigo} className="border-t">
                <td className="px-4 py-2">{l.idlocalidad || l.id || l.codigo}</td>
                <td className="px-4 py-2">{l.nombre_localidad || l.nombre}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{ setEditing(l); setOpen(true) }} className="p-2 rounded hover:bg-slate-100"><i className="bi bi-pencil" /></button>
                    <button onClick={()=>onDeactivate(l)} className="p-2 rounded hover:bg-slate-100 text-red-600"><i className="bi bi-x-circle" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && (
              <tr><td className="px-4 py-4" colSpan={3}>Cargando...</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal open={open} title={editing ? 'Editar localidad' : 'Crear localidad'} onClose={()=>setOpen(false)}>
        <LocalityForm initial={editing} onClose={()=>setOpen(false)} onSaved={()=>{ setOpen(false); load() }} />
      </Modal>
    </div>
  )
}
