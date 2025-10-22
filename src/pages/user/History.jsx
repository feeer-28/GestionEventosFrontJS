import { useEffect, useState } from 'react'
import { UserAPI } from '../../lib/api'

export default function UserHistory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qEvent, setQEvent] = useState('')
  const [qDate, setQDate] = useState('')

  useEffect(() => {
    async function load() {
      setError('')
      setLoading(true)
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        if (!user) return
        const data = await UserAPI.comprasUsuario(user.idusuario)
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Error al cargar historial')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = items.filter(e => {
    const name = (e.evento?.nombre || e.evento_nombre || '').toLowerCase()
    const date = (e.fecha || e.created_at || '').slice(0,10)
    const okName = !qEvent || name.includes(qEvent.toLowerCase())
    const okDate = !qDate || date === qDate
    return okName && okDate
  })

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-900">Historial de compras</h2>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={qEvent} onChange={e=>setQEvent(e.target.value)} placeholder="Buscar por evento" className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        <input type="date" value={qDate} onChange={e=>setQDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-left">
          <thead className="bg-purple-50 text-purple-800">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Evento</th>
              <th className="px-4 py-2">Localidad</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Método</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.map(e => {
              const eventoNombre = e.evento?.nombre || e.evento_nombre || '-'
              // Soporte para diferentes estructuras de respuesta
              const detalles = Array.isArray(e.detalles) ? e.detalles : []
              const cantidad = detalles.reduce((acc, d) => acc + (Number(d.cantidad)||1), 0) || e.cantidad || '-'
              const localidad = detalles.map(d => d.localidad?.nombre || d.localidad_nombre).filter(Boolean).join(', ') || e.localidad_nombre || '-'
              const fecha = (e.fecha_compra || e.fecha || e.created_at || '').replace('T',' ').replace('Z','') || '-'
              const estado = e.estado || 'exitosa'
              return (
                <tr key={e.idcomprar || e.id} className="border-t">
                  <td className="px-4 py-2">{e.idcomprar || e.id}</td>
                  <td className="px-4 py-2">{eventoNombre}</td>
                  <td className="px-4 py-2">{localidad}</td>
                  <td className="px-4 py-2">{cantidad}</td>
                  <td className="px-4 py-2">${e.valor_total}</td>
                  <td className="px-4 py-2">{e.metodo_pago?.nombre || e.metodo_pago_idmetodo_pago}</td>
                  <td className="px-4 py-2">{fecha}</td>
                  <td className="px-4 py-2">{estado}</td>
                </tr>
              )
            })}
            {loading && (
              <tr><td className="px-4 py-4" colSpan={8}>Cargando...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
