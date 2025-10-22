import { useEffect, useState } from 'react'
import { AdminAPI, ArtistAPI } from '../../lib/api'
import Modal from '../../components/Modal'
import ArtistForm from '../../components/ArtistForm'
import { useToast } from '../../context/ToastContext'

export default function AdminArtists() {
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
      // Preferir backend Spring para listar artistas
      let data = []
      try {
        data = await ArtistAPI.list()
      } catch (e) {
        // Si falla el backend Spring, intentar el API existente
        data = await AdminAPI.artistas()
      }
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Error al cargar artistas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onDeactivate(a) {
    if (!confirm('¿Desactivar este artista?')) return
    try {
      await ArtistAPI.setStatus(a.idartista || a.id || a.id_artist, 0)
      show('Artista desactivado', 'success')
      await load()
    } catch (err) {
      show(err.message || 'No se pudo desactivar', 'error')
    }
  }

  async function onActivate(a) {
    if (!confirm('¿Activar este artista?')) return
    try {
      await ArtistAPI.setStatus(a.idartista || a.id || a.id_artist, 1)
      show('Artista activado', 'success')
      await load()
    } catch (err) {
      show(err.message || 'No se pudo activar', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Artistas</h2>
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
              <th className="px-4 py-2">Género</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.map(e => (
              <tr key={e.idartista || e.id || e.id_artist || e.id} className="border-t">
                <td className="px-4 py-2">{e.nombre || e.name}</td>
                <td className="px-4 py-2">{e.genderMusic?.name || e.genero_musical?.nombre_genero || e.genero || e.genero_musical?.descripcion || e.genderMusic?.id_genderMusic}</td>
                <td className="px-4 py-2 capitalize">{e.estado || (typeof e.status === 'number' ? (e.status === 1 ? 'activo' : 'inactivo') : e.status)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{ setEditing(e); setOpen(true) }} className="p-2 rounded hover:bg-slate-100"><i className="bi bi-pencil" /></button>
                    {((e.estado ? e.estado === 'activo' : (typeof e.status === 'number' ? e.status === 1 : e.status === 'activo')))
                      ? (
                        <button onClick={()=>onDeactivate(e)} className="p-2 rounded hover:bg-slate-100 text-red-600"><i className="bi bi-x-circle" /></button>
                      ) : (
                        <button onClick={()=>onActivate(e)} className="p-2 rounded hover:bg-slate-100 text-emerald-600"><i className="bi bi-check-circle" /></button>
                      )}
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
      <Modal open={open} title={editing ? 'Editar artista' : 'Crear artista'} onClose={()=>setOpen(false)}>
        <ArtistForm initial={editing} onClose={()=>setOpen(false)} onSaved={()=>{ setOpen(false); load() }} />
      </Modal>
    </div>
  )
}
