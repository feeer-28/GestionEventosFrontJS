import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminEvents from './pages/admin/Events.jsx'
import AdminArtists from './pages/admin/Artists.jsx'
import AdminLocalities from './pages/admin/Localities.jsx'
import AdminTicketing from './pages/admin/Ticketing.jsx'
import UserLayout from './layouts/UserLayout.jsx'
import UserEvents from './pages/user/Events.jsx'
import UserHistory from './pages/user/History.jsx'
import EventDetail from './pages/user/EventDetail.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas públicas de eventos */}
        <Route path="/events" element={<UserEvents />} />
        <Route path="/events/:id" element={<EventDetail />} />

        <Route path="/admin" element={<ProtectedRoute role="administrador"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="events" replace />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="artists" element={<AdminArtists />} />
          <Route path="localities" element={<AdminLocalities />} />
          <Route path="ticketing" element={<AdminTicketing />} />
        </Route>

        <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="events" replace />} />
          <Route path="events" element={<UserEvents />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="history" element={<UserHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
