import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { User } from '../types'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setOAuthSession, isAuthenticated, isAdmin } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
      return
    }

    const token = searchParams.get('token')
    const userId = searchParams.get('user_id')
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const role = searchParams.get('role')

    if (!token) {
      setError('Токен авторизации не получен')
      return
    }

    const user: User = {
      id: Number(userId) || 0,
      username: name || email || '',
      email: email || '',
      role: role === 'Admin' ? 'admin' : 'client',
    }

    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
    setOAuthSession(token, user)
  }, [searchParams, navigate, setOAuthSession, isAuthenticated, isAdmin])

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <h1>LogisticsPro</h1>
          <p style={{ color: 'var(--color-danger)', margin: '20px 0' }}>{error}</p>
          <a href="/login" className="btn btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Вернуться к входу
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ textAlign: 'center' }}>
        <h1>LogisticsPro</h1>
        <div className="loading-spinner" style={{ margin: '30px auto' }}></div>
        <p>Выполняется вход...</p>
      </div>
    </div>
  )
}
