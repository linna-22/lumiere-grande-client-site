import { useCallback, useEffect, useState } from 'react'
import { apiFetch, fetchCsrfCookie, setToken, clearToken } from '../api/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkSession = useCallback(async () => {
    try {
      const data = await apiFetch('/user/me')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = useCallback(async ({ email, password }) => {
    await fetchCsrfCookie()
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.access_token) {
      setToken(data.access_token)
      setUser(data.user)
    }
    return data
  }, [])

  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    await fetchCsrfCookie()
    const data = await apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })
    // No access_token in response currently — see note above.
    // Once backend adds it, this becomes: if (data.access_token) { setToken(...); setUser(data.user) }
    return data
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/logout', { method: 'POST' })
    clearToken()
    setUser(null)
  }, [])

  return { user, loading, login, register, logout, checkSession, isAuthenticated: Boolean(user) }
}