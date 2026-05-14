import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isDriver: boolean
  isClient: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    fullName: string
    email: string
    nameOfCompany: string
    password: string
    adminCode?: string
  }) => Promise<void>
  logout: () => void
  setOAuthSession: (token: string, user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('auth_token')
  )

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth_user')
    }
  }, [user])

  useEffect(() => {
    const onStorage = () => {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      setToken(storedToken)
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function mapUser(id: number, fullName: string, email: string, role: string): User {
    return {
      id,
      username: fullName,
      email,
      role: role === 'Admin' ? 'admin' : 'client',
    }
  }

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setToken(res.token)
    setUser(mapUser(res.id, res.fullName, res.email, res.role))
  }

  const register = async (data: {
    fullName: string
    email: string
    nameOfCompany: string
    password: string
    adminCode?: string
  }) => {
    const res = await authApi.register(data)
    setToken(res.token || res.adminToken || null)
    setUser(mapUser(res.id, res.fullName, res.email, res.role))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const setOAuthSession = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isDriver: user?.role === 'driver',
        isClient: user?.role === 'client',
        login,
        register,
        logout,
        setOAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
