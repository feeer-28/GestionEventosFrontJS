import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    try {
      const u = localStorage.getItem('user')
      const t = localStorage.getItem('token')
      if (u && t) { setUser(JSON.parse(u)); setToken(t) }
    } catch {}
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    role: user?.rol || null,
    setAuth: (u, t) => { setUser(u); setToken(t); localStorage.setItem('user', JSON.stringify(u)); localStorage.setItem('token', t) },
    clearAuth: () => { setUser(null); setToken(null); localStorage.removeItem('user'); localStorage.removeItem('token') },
  }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
