import { Container, Row, Col, Button } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { UserAPI, CatalogAPI } from '../lib/api'

const LandingPage = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ depto: '', muni: '', fecha: '', name: '' })
  const [departamentos, setDepartamentos] = useState([])
  const [municipios, setMunicipios] = useState([])

  useEffect(() => {
    async function init() {
      try {
        const [deps, munis] = await Promise.all([
          CatalogAPI.departamentos(),
          CatalogAPI.municipios(),
        ])
        setDepartamentos(Array.isArray(deps) ? deps : [])
        setMunicipios(Array.isArray(munis) ? munis : [])
      } catch {}
    }
    init()
  }, [])

  useEffect(() => {
    async function load() {
      setError('')
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.depto) params.append('departamento_id', filters.depto)
        if (filters.muni) params.append('municipio_id', filters.muni)
        if (filters.fecha) params.append('fecha', filters.fecha)
        if (filters.name) params.append('q', filters.name)
        const data = await UserAPI.eventos(params.toString() ? `?${params.toString()}` : '')
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Error al cargar eventos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filters.depto, filters.muni, filters.fecha, filters.name])

  return (
    <div className="bg-white">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm">
        <Container>
          <div className="navbar-brand d-flex align-items-center">
            <div 
              className="me-2 d-flex align-items-center justify-content-center"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#e9c216ff',
                borderRadius: '6px'
              }}
            >
              <i className="bi bi-ticket-perforated text-white"></i>
            </div>
            <span className="fw-bold fs-4 d-inline-flex align-items-center gap-2" style={{ color: '#a252d6ff' }}>
              <i className="bi bi-music-note-beamed"></i> BoletaFest
            </span>
          </div>

          <div className="d-flex gap-2">
            <Button
              onClick={() => navigate('/login')}
              variant="link"
              className="text-decoration-none fw-medium"
              style={{ color: '#f09f36ff' }}
            >
              Iniciar sesion
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="px-4 py-2 fw-medium"
              style={{
                backgroundColor: '#f09f36ff',
                border: 'none',
                borderRadius: '6px'
              }}
            >
              Registrarse
            </Button>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="py-5" style={{ backgroundColor: '#F5F7FA' }}>
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="pe-lg-5">
              <h1 className="display-4 fw-bold mb-4" style={{ color: '#2E2E2E' }}>
                Has parte de los mejores <span style={{ color: '#a252d6ff' }}>eventos</span> de nuestro pais.
              </h1>
              <p className="fs-5 text-muted mb-4">
                Compra tus boletas de manera facil, rapida y segura.
              </p>
            </Col>
            <Col lg={6} className="text-center">
              <div className="position-relative">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9hUt-FXjs5j3Mym6AgZKXngYixCUtTTTAoA&s"
                  alt="foto"
                  className="img-fluid rounded-3"
                  style={{
                    maxHeight: '520px',
                    objectFit: 'cover',
                    filter: 'brightness(1.1)'
                  }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Filtros y Eventos disponibles */}
      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0" style={{ color: '#2E2E2E' }}>Eventos disponibles</h2>
            <Button variant="link" className="text-decoration-none" style={{ color: '#a252d6ff' }} onClick={()=>navigate('/events')}>
              Ver todos
            </Button>
          </div>
          <Row className="g-2 mb-3">
            <Col xs={12} md={3}>
              <select value={filters.depto} onChange={(e)=>setFilters(p=>({...p, depto: e.target.value, muni: ''}))} className="form-select">
                <option value="">Departamento</option>
                {departamentos.map(d => (
                  <option key={d.iddepartamento} value={d.iddepartamento}>{d.nombre_departamento}</option>
                ))}
              </select>
            </Col>
            <Col xs={12} md={3}>
              <select value={filters.muni} onChange={(e)=>setFilters(p=>({...p, muni: e.target.value}))} className="form-select">
                <option value="">Municipio</option>
                {municipios.filter(m => !filters.depto || m.departamento_iddepartamento == filters.depto).map(m => (
                  <option key={m.idmunicipio} value={m.idmunicipio}>{m.nombre_municipio}</option>
                ))}
              </select>
            </Col>
            <Col xs={12} md={3}>
              <input type="date" value={filters.fecha} onChange={(e)=>setFilters(p=>({...p, fecha: e.target.value}))} className="form-control" />
            </Col>
            <Col xs={12} md={3}>
              <input type="text" value={filters.name} onChange={(e)=>setFilters(p=>({...p, name: e.target.value}))} placeholder="Buscar por nombre" className="form-control" />
            </Col>
          </Row>
          {error && <div className="text-danger small mb-2">{error}</div>}
          <Row className="g-3">
            {!loading && items.slice(0,6).map(e => (
              <Col key={e.ideventos || e.id} xs={12} sm={6} lg={4}>
                <Link to={`/events/${e.ideventos || e.id}`} className="text-decoration-none">
                  <div className="p-3 border rounded-3 h-100" style={{ background: '#ffffff' }}>
                    <div className="fw-semibold" style={{ color: '#2E2E2E' }}>{e.nombre_evento || e.nombre}</div>
                    <div className="text-muted small">{e.municipio?.nombre_municipio || ''}</div>
                    <div className="text-muted small">{e.fecha_inicio}{e.fecha_fin ? ` - ${e.fecha_fin}` : ''}</div>
                  </div>
                </Link>
              </Col>
            ))}
            {loading && (
              <Col xs={12}><div className="text-muted">Cargando...</div></Col>
            )}
            {!loading && items.length === 0 && (
              <Col xs={12}><div className="text-muted">No hay eventos disponibles por ahora.</div></Col>
            )}
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-4" style={{ backgroundColor: '#ffffffff' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center text-black">
                <div 
                  className="me-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#f5a613ff',
                    borderRadius: '6px'
                  }}
                >
                  <i className="bi bi-ticket-perforated"></i>
                </div>
                <span className="fw-bold fs-5 d-inline-flex align-items-center gap-2">
                  <i className="bi bi-music-note-beamed"></i> BoletaFest
                </span>
              </div>
              <p className="text-muted small mt-2 mb-0">Copyright © 2024 BoletaFest ltd.</p>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Back to V1 Button */}
      <div className="position-fixed bottom-0 end-0 p-3">
        <Button
          onClick={() => navigate('/')}
          variant="outline-primary"
          className="rounded-circle"
          style={{ width: '50px', height: '50px' }}
        >
          <i className="fas fa-arrow-left"></i>
        </Button>
      </div>
    </div>
  )
}

export default LandingPage;
