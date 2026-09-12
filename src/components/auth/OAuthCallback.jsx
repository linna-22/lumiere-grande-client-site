// src/pages/auth/OAuthCallback.jsx
import { useEffect } from 'react'

export default function OAuthCallback({ onNavigate }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('auth_token', token)
      onNavigate?.('Dashboard')
    } else {
      onNavigate?.('Login')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 text-white">
      Signing you in...
    </div>
  )
}