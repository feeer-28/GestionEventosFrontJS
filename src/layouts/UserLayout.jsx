import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { AuthAPI } from '../lib/api'
import Modal from '../components/Modal'
import ProfileForm from '../components/ProfileForm'

export default function UserLayout() {
  const navigate = useNavigate()
  async function logout() {
    try { await AuthAPI.logout() } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }
  const [open, setOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-slate-50 text-blue-900">
      <header className="bg-white/90 backdrop-blur px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <button className="sm:hidden inline-flex items-center justify-center rounded bg-purple-600 hover:bg-purple-500 text-white px-3 py-2" onClick={()=>setNavOpen(v=>!v)} aria-label="Abrir menú">
              <i className="bi bi-list text-lg" />
            </button>
            <div className="font-bold">Gestión Eventos</div>
          </div>
          <nav className="hidden sm:flex items-center gap-2">
            <NavLink to="/user/events" className={({isActive})=>`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm ${isActive?'bg-purple-600 text-white shadow':'text-blue-900 hover:bg-purple-50'}`}>
              <i className="bi bi-calendar-event" /> Eventos
            </NavLink>
            <NavLink to="/user/history" className={({isActive})=>`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm ${isActive?'bg-purple-600 text-white shadow':'text-blue-900 hover:bg-purple-50'}`}>
              <i className="bi bi-clock-history" /> Historial
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white"><i className="bi bi-person-circle" /> Perfil</button>
            <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-white"><i className="bi bi-box-arrow-right" /> Salir</button>
          </div>
        </div>
      </header>
      {navOpen && (
        <div className="sm:hidden bg-white border-b px-4 py-2 shadow">
          <nav className="max-w-6xl mx-auto flex flex-col gap-2">
            <NavLink to="/user/events" onClick={()=>setNavOpen(false)} className={({isActive})=>`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${isActive?'bg-purple-600 text-white shadow':'hover:bg-purple-50'}`}>
              <i className="bi bi-calendar-event" /> Eventos
            </NavLink>
            <NavLink to="/user/history" onClick={()=>setNavOpen(false)} className={({isActive})=>`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${isActive?'bg-purple-600 text-white shadow':'hover:bg-purple-50'}`}>
              <i className="bi bi-clock-history" /> Historial
            </NavLink>
          </nav>
        </div>
      )}
      <div className="p-4 max-w-6xl mx-auto">
        <Outlet />
      </div>
      <Modal open={open} title="Perfil" onClose={()=>setOpen(false)}>
        <ProfileForm onClose={()=>setOpen(false)} onSaved={()=>setOpen(false)} />
      </Modal>
    </div>
  )
}
