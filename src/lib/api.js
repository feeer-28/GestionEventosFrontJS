const BASE_URL = 'http://localhost:3333'

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Basic ${token}` } : {}
}

export const PaymentMethodAPI = {
  async list() {
    const res = await fetch('http://localhost:8081/api/v1/payment-method/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : null
  }
}

export const TicketAPI = {
  async list() {
    const res = await fetch('http://localhost:8081/api/v1/ticket/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : []
  }
}

export const BuyoutAPI = {
  async create(body) {
    const res = await fetch('http://localhost:8081/api/v1/buyout/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return ct.includes('application/json') ? res.json() : null
  }
}

// Spring auth/login for the app's Login.jsx
export const LoginAPI = {
  async login(email, password) {
    const res = await fetch('http://localhost:8081/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
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
    const data = ct.includes('application/json') ? await res.json() : {}
    // Normalizar para preservar id_user, role y person cuando existan
    const roleName = (data.role?.name || data.role || data.rol || 'CLIENT')
    const fullName = data.person?.full_name || ''
    const parts = String(fullName).trim().split(' ')
    const apellidos = parts.length > 1 ? parts.slice(1).join(' ') : ''
    const nombre = parts[0] || ''
    const idFromData = (
      data.id_user ?? data.idUser ?? data.id ??
      data.user?.id_user ?? data.user?.idUser ?? data.user?.id ?? data.user?.idusuario ??
      data.person?.id_user ?? data.person?.idUser ?? null
    )
    const user = {
      id_user: idFromData ?? null,
      email: data.email ?? data.user?.email ?? email,
      rol: roleName,
      // Campos auxiliares para UI
      nombre,
      apellidos,
      tipodocumento: data.person?.type_identification || 'CC',
      documento: data.person?.number_identification != null ? String(data.person.number_identification) : '',
    }
    return {
      user,
      token: data.token || data.accessToken || data.jwt || null,
    }
  }
}

// Spring person register for Register.jsx
export const RegisterApi = {
  async register(payload) {
    const fullName = [payload.nombre || '', payload.apellidos || ''].filter(Boolean).join(' ').trim()
    const body = {
      fullName,
      numberIdentification: Number(payload.documento),
      typeIdentification: String(payload.tipodocumento || 'CC'),
      email: payload.email,
      password: payload.password,
    }
    const res = await fetch('http://localhost:8081/api/v1/person/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    const data = ct.includes('application/json') ? await res.json() : {}
    return {
      user: data.user || data.person || { fullName, email: body.email, rol: payload.rol || 'cliente' },
      token: data.token || data.accessToken || null,
    }
  }
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

// API específica para consumir artistas desde el backend Spring
export const ArtistAPI = {
  async list() {
    const res = await fetch('http://localhost:8081/api/v1/artist/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : []
  },
  async genders() {
    const res = await fetch('http://localhost:8081/api/v1/gendermusic/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : []
  },
  async create(body) {
    const res = await fetch('http://localhost:8081/api/v1/artist/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return ct.includes('application/json') ? res.json() : null
  },
  async update(id, body) {
    const res = await fetch(`http://localhost:8081/api/v1/artist/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return ct.includes('application/json') ? res.json() : null
  },
  async setStatus(id, status) {
    const url = `http://localhost:8081/api/v1/artist/${id}/status?status=${status}`
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      let data
      try { data = await res.json() } catch { data = { message: res.statusText } }
      const error = new Error(data.message || 'Error de servidor')
      error.status = res.status
      error.data = data
      throw error
    }
    return null
  }
}

export const LocatedAPI = {
    async list() {
    const res = await fetch('http://localhost:8081/api/v1/locatedevent/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : []
  },
  async create (body) {
    const res = await fetch('http://localhost:8081/api/v1/locatedevent/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return ct.includes('application/json') ? res.json() : null
  },
  async actualizarLocalidad(id, body) {
    const res = await fetch(`http://localhost:8081/api/v1/locatedevent/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return ct.includes('application/json') ? res.json() : null
  },
  async eliminarLocalidad(id) {
    const res = await fetch(`http://localhost:8081/api/v1/locatedevent/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : null
  }
}

export const EventoAPI = {
  async create(body) {
    const res = await fetch('http://localhost:8081/api/v1/event/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return ct.includes('application/json') ? res.json() : null
  },
  async list(filters = {}) {
    const qs = new URLSearchParams()
    if (filters.municipioId != null) qs.set('municipioId', filters.municipioId)
    if (filters.departmentId != null) qs.set('departmentId', filters.departmentId)
    if (filters.startDate) qs.set('startDate', filters.startDate)
    if (filters.endDate) qs.set('endDate', filters.endDate)
    if (filters.filter) qs.set('filter', filters.filter)
    const url = `http://localhost:8081/api/v1/event/${qs.toString() ? `?${qs.toString()}` : ''}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : []
  },
  async getById(id) {
    const res = await fetch(`http://localhost:8081/api/v1/event/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : null
  },
  async getDetail(id) {
    const res = await fetch(`http://localhost:8081/api/v1/event/${id}/detail`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : null
  },
  async update(id, body) {
    const res = await fetch(`http://localhost:8081/api/v1/event/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return ct.includes('application/json') ? res.json() : null
  },
  async setStatus(id, status) {
    const res = await fetch(`http://localhost:8081/api/v1/event/${id}/status?status=${status}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      let data
      try { data = await res.json() } catch { data = { message: res.statusText } }
      const error = new Error(data.message || 'Error de servidor')
      error.status = res.status
      error.data = data
      throw error
    }
    return null
  }
}

export const MunicipioAPI = {
  async list() {
    const res = await fetch('http://localhost:8081/api/v1/municipio/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : []
  }
}

export const DepartmentAPI = {
  async list() {
    const res = await fetch('http://localhost:8081/api/v1/department/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : []
  }
}

export const UserProfileAPI = {
  async get(id) {
    const res = await fetch(`http://localhost:8081/api/v1/user/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    return ct.includes('application/json') ? res.json() : null
  },
  async update(id, body) {
    const res = await fetch(`http://localhost:8081/api/v1/user/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return ct.includes('application/json') ? res.json() : null
  }
}
