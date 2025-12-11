import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'


const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Bootstrap user from token on first load
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(res => setUser(res.data.user || null))
      .catch(() => { localStorage.removeItem('token'); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  // login stays the same
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('role', res.data.user.role)

    // Immediately refetch full user WITH clubRoles
    const meRes = await api.get('/auth/me')

    setUser(meRes.data.user)
    return meRes.data.user
  }, [])


  // 🟢 updated register (supports both JSON and FormData)
  const register = useCallback(async (data) => {
    let res
    if (data instanceof FormData) {
      res = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      res = await api.post('/auth/register', data)
    }

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('role', res.data.user.role)

    // Fetch full user with clubRoles
    const meRes = await api.get('/auth/me')
    setUser(meRes.data.user)
    return meRes.data.user
  }, [])


  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
