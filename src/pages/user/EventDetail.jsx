import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { CatalogAPI, UserAPI } from '../../lib/api'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [layout, setLayout] = useState([])
  const [asientosDef, setAsientosDef] = useState([])
  const [metodos, setMetodos] = useState([])
  const [sel, setSel] = useState([]) // [{localidad, index}]
  const [metodo, setMetodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [card, setCard] = useState('')

  useEffect(() => {
    async function load() {
      setError('')
      setLoading(true)
      try {
        const [ev, lay, asientos, mps] = await Promise.all([
          UserAPI.evento(id),
          UserAPI.layoutAsientos(id),
          UserAPI.asientosEvento(id),
          CatalogAPI.metodosPago(),
        ])
        setEvento(ev)
        setLayout(Array.isArray(lay) ? lay : [])
        setAsientosDef(Array.isArray(asientos) ? asientos : [])
        setMetodos(Array.isArray(mps) ? mps : [])
      } catch (err) {
        setError(err.message || 'Error al cargar evento')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const precioPorLocalidad = useMemo(() => {
    const map = {}
    layout.forEach(l => { map[l.localidad] = l.valor_asiento })
    return map
  }, [layout])

  const asientoIdPorLocalidad = useMemo(() => {
    const map = {}
    asientosDef.forEach(a => { map[a.nombre_localidad] = a.idlocalidad_evento })
    return map
  }, [asientosDef])

  const total = useMemo(() => sel.reduce((acc, s) => acc + (precioPorLocalidad[s.localidad] || 0), 0), [sel, precioPorLocalidad])

  const disponibilidadPorLocalidad = useMemo(() => {
    const map = {}
    layout.forEach(l => {
      const disponibles = Array.isArray(l.puestos) ? l.puestos.filter(p => p.estado === 'disponible').length : 0
      map[l.localidad] = disponibles
    })
    return map
  }, [layout])

  function toggle(localidad, index) {
    setError('')
    const key = `${localidad}:${index}`
    const isSelected = sel.some(x => `${x.localidad}:${x.index}` === key)
    if (isSelected) {
      setSel(prev => prev.filter(x => `${x.localidad}:${x.index}` !== key))
      return
    }
    const countLocalidad = sel.filter(x => x.localidad === localidad).length
    if (countLocalidad >= 10) {
      setError('Máximo 10 boletas por localidad por transacción')
      return
    }
    const disp = disponibilidadPorLocalidad[localidad] || 0
    if (countLocalidad + 1 > disp) {
      setError('No hay disponibilidad suficiente en esta localidad')
      return
    }
    setSel(prev => [...prev, { localidad, index }])
  }

  async function pagar() {
    setError('')
    if (!metodo) { setError('Selecciona un método de pago'); return }
    if (sel.length===0) { setError('Selecciona al menos 1 asiento'); return }
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user) { navigate('/register'); return }
    // Validar límites por localidad
    const porLocalidad = sel.reduce((acc, s) => { acc[s.localidad] = (acc[s.localidad]||0)+1; return acc }, {})
    for (const [loc, cant] of Object.entries(porLocalidad)) {
      if (cant > 10) { setError('Máximo 10 boletas por localidad por transacción'); return }
      const disp = disponibilidadPorLocalidad[loc] || 0
      if (cant > disp) { setError('No hay disponibilidad suficiente en esta localidad'); return }
    }
    // Validar número de tarjeta mock (15 dígitos)
    if (!/^\d{15}$/.test(card)) { setError('Ingresa un número de tarjeta de 15 dígitos'); return }
    try {
      const compra = await UserAPI.crearCompra({
        idcomprar: undefined,
        valor_total: String(total),
        metodo_pago_idmetodo_pago: Number(metodo),
        usuario_idusuario: user.idusuario,
      })
      const compraId = compra.idcomprar || compra.id || compra?.compra?.idcomprar
      for (const s of sel) {
        const asientoId = asientoIdPorLocalidad[s.localidad]
        const valor = precioPorLocalidad[s.localidad] || 0
        await UserAPI.crearBoleta({
          idboleta: undefined,
          valor_total: valor,
          compra_idcomprar: compraId,
          asiento_idlocalidad_evento: asientoId,
        })
      }
      navigate('/user/history')
    } catch (err) {
      setError(err.message || 'No se pudo procesar el pago')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="text-2xl font-bold text-blue-900">{evento?.nombre_evento || 'Evento'}</div>
        <div className="text-slate-600">{evento?.descripcion}</div>
        <div className="text-slate-600">{evento?.fecha_inicio}{evento?.fecha_fin ? ` - ${evento.fecha_fin}` : ''}</div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <div className="font-semibold">Selecciona asientos</div>
        {loading && <div className="text-slate-600">Cargando...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && (
          <div className="space-y-4">
            {layout.map((l, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{l.localidad}</div>
                  <div className="text-sm text-slate-600">${l.valor_asiento}</div>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-3">
                  {l.puestos?.map((p, i) => (
                    <button
                      key={i}
                      disabled={p.estado !== 'disponible'}
                      onClick={()=>toggle(l.localidad, p.index)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] disabled:opacity-40 ${sel.some(x=>x.localidad===l.localidad && x.index===p.index)?'bg-purple-600 text-white':'bg-white'}`}
                      title={`${l.localidad} - ${p.index}`}
                    >
                      {p.index}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <select value={metodo} onChange={e=>setMetodo(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Método de pago</option>
            {metodos.map(m => (
              <option key={m.idmetodo_pago} value={m.idmetodo_pago}>{m.nombre}</option>
            ))}
          </select>
          <div>
            <input
              type="text"
              value={card}
              onChange={e=>setCard(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Número de tarjeta (15 dígitos)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={15}
            />
            <div className="text-xs text-slate-500 mt-1">Dato de prueba, solo números (15 dígitos)</div>
          </div>
          <div className="text-slate-700 font-semibold">Total: ${total}</div>
          <button onClick={pagar} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white">
            <i className="bi bi-credit-card" /> Pagar
          </button>
        </div>
      </div>
    </div>
  )
}
