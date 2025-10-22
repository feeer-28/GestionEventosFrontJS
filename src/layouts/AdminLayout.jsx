import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { AuthAPI } from '../lib/api'
import Modal from '../components/Modal'
import ProfileForm from '../components/ProfileForm'

export default function AdminLayout() {
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
    <div className="min-h-screen md:h-screen w-full overflow-hidden grid grid-cols-1 md:grid-cols-[260px_1fr] bg-white">
      <aside className={`${navOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:static inset-y-0 left-0 w-64 md:w-auto transform transition-transform duration-200 z-20 bg-orange-500 text-white p-4 flex md:flex-col items-center md:items-stretch gap-2 md:h-full overflow-y-auto`}>
        <div className="text-lg font-bold flex items-center gap-2"><i className="bi bi-lightning-charge text-purple-200" /> Admin</div>
        <nav className="flex md:flex-col gap-2 w-full">
          <NavLink to="/admin/events" className={({isActive})=>`px-3 py-2 rounded text-white ${isActive?'bg-purple-700':'hover:bg-purple-600/80'}`}>
            <i className="bi bi-calendar-event text-purple-200" /> Eventos
          </NavLink>
          <NavLink to="/admin/artists" className={({isActive})=>`px-3 py-2 rounded text-white ${isActive?'bg-purple-700':'hover:bg-purple-600/80'}`}>
            <i className="bi bi-music-note-beamed text-purple-200" /> Artistas
          </NavLink>
          <NavLink to="/admin/localities" className={({isActive})=>`px-3 py-2 rounded text-white ${isActive?'bg-purple-700':'hover:bg-purple-600/80'}`}>
            <i className="bi bi-geo text-purple-200" /> Localidades
          </NavLink>
          <NavLink to="/admin/ticketing" className={({isActive})=>`px-3 py-2 rounded text-white ${isActive?'bg-purple-700':'hover:bg-purple-600/80'}`}>
            <i className="bi bi-ticket text-purple-200" /> Boletería
          </NavLink>
        </nav>
        <button onClick={logout} className="mt-auto md:mt-auto inline-flex items-center gap-2 px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white"> 
          <i className="bi bi-box-arrow-right" /> Cerrar sesión
        </button>
      </aside>
      {/* Backdrop mobile */}
      {navOpen && <div className="fixed inset-0 bg-black/40 md:hidden z-10" onClick={()=>setNavOpen(false)} />}
      <main className="bg-slate-50 text-blue-900 h-full overflow-y-auto">
        <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden inline-flex items-center justify-center rounded bg-purple-600 hover:bg-purple-500 text-white px-3 py-2" onClick={()=>setNavOpen(true)}>
              <i className="bi bi-list text-lg" />
            </button>
            <div className="font-semibold">Panel Administrador</div>
          </div>
          <button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white">
            <i className="bi bi-person-circle text-xl" /> Perfil
          </button>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
      <Modal open={open} title="Perfil" onClose={()=>setOpen(false)}>
        <ProfileForm onClose={()=>setOpen(false)} onSaved={()=>setOpen(false)} />
      </Modal>
    </div>
  )
}

