const BASE_URL = 'http://localhost:3333'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Basic ${token}` } : {}
}

export async function apiFetch(path, { method = 'GET', headers = {}, body, auth = false } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers }
  if (auth) Object.assign(h, authHeader())
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let data
    try { data = await res.json() } catch { data = { message: res.statusText } }
    const error = new Error(data.message || 'Error de servidor')
    error.status = res.status
    error.data = data
    throw error
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export function encodeBasic(email, password) {
  return btoa(`${email}:${password}`)
}

export const AuthAPI = {
  async login(email, password) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
    const token = data.token || encodeBasic(email, password)
    return { user: data.user, token }
  },
  async register(payload) {
    const body = { ...payload }
    const data = await apiFetch('/auth/register', { method: 'POST', body })
    return { user: data.user, token: data.token }
  },
  async logout() {
    return apiFetch('/auth/logout', { method: 'POST', auth: true })
  },
  async update(id, body) {
    return apiFetch(`/auth/${id}`, { method: 'PUT', body, auth: true })
  },
}

export const CatalogAPI = {
  departamentos() { return apiFetch('/departamentos') },
  municipios(params = '') { return apiFetch(`/municipios${params}`) },
  generos() { return apiFetch('/generos-musicales') },
  metodosPago() { return apiFetch('/metodos-pago') },
}

export const AdminAPI = {
  eventos(query = '') { return apiFetch(`/eventos${query}`, { auth: true }) },
  crearEvento(body) { return apiFetch('/eventos', { method: 'POST', body, auth: true }) },
  actualizarEvento(id, body) { return apiFetch(`/eventos/${id}`, { method: 'PUT', body, auth: true }) },
  desactivarEvento(id) { return apiFetch(`/eventos/${id}/desactivar`, { method: 'PATCH', body: {}, auth: true }) },

  artistas() { return apiFetch('/artistas', { auth: true }) },
  crearArtista(body) { return apiFetch('/artistas', { method: 'POST', body, auth: true }) },
  actualizarArtista(id, body) { return apiFetch(`/artistas/${id}`, { method: 'PUT', body, auth: true }) },
  desactivarArtista(id) { return apiFetch(`/artistas/${id}/desactivar`, { method: 'PATCH', body: {}, auth: true }) },
  asignarArtistaEvento(body) { return apiFetch('/artistas/asignar-evento', { method: 'POST', body, auth: true }) },

  // Localidades (RF3)
  localidades() { return apiFetch('/localidades', { auth: true }) },
  crearLocalidad(body) { return apiFetch('/localidades', { method: 'POST', body, auth: true }) },
  actualizarLocalidad(id, body) { return apiFetch(`/localidades/${id}`, { method: 'PUT', body, auth: true }) },
  desactivarLocalidad(id) { return apiFetch(`/localidades/${id}/desactivar`, { method: 'PATCH', body: {}, auth: true }) },

  // Boletería (RF2)
  boleteria(eventoId) { return apiFetch(`/eventos/${eventoId}/boleteria`, { auth: true }) },
  crearBoleteria(eventoId, body) { return apiFetch(`/eventos/${eventoId}/boleteria`, { method: 'POST', body, auth: true }) },
  actualizarBoleteria(id, body) { return apiFetch(`/boleteria/${id}`, { method: 'PUT', body, auth: true }) },
  eliminarBoleteria(id) { return apiFetch(`/boleteria/${id}`, { method: 'DELETE', auth: true }) },
}

export const UserAPI = {
  eventos(params = '') { return apiFetch(`/eventos${params}`) },
  evento(id) { return apiFetch(`/eventos/${id}`) },
  asientosEvento(id) { return apiFetch(`/asientos?evento_id=${id}`) },
  layoutAsientos(id) { return apiFetch(`/eventos/${id}/asientos/layout`, { auth: true }) },
  comprasUsuario(usuario_id) { return apiFetch(`/compras?usuario_id=${usuario_id}`, { auth: true }) },
  crearCompra(body) { return apiFetch('/compras', { method: 'POST', body, auth: true }) },
  crearBoleta(body) { return apiFetch('/boletas', { method: 'POST', body, auth: true }) },
}
