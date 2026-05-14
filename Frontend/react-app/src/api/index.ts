const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(
      (errorData as { message?: string }).message ||
        `Request failed with status ${res.status}`
    )
  }

  return res.json()
}

interface LoginResponse {
  token: string
  id: number
  email: string
  fullName: string
  nameOfCompany: string
  role: string
}

interface RegisterResponse {
  token?: string
  adminToken?: string
  id: number
  email: string
  fullName: string
  nameOfCompany: string
  role: string
}

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: {
    fullName: string
    email: string
    nameOfCompany: string
    password: string
    adminCode?: string
  }) =>
    request<RegisterResponse>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const ordersApi = {
  getAllForAdmin: () =>
    request<any[]>('/Order/getOrdersListForAdmin'),
  getMy: () =>
    request<any[]>('/Order/getOrdersListForUser'),
  create: (data: {
    route: { startLocation: string; endLocation: string; deliveryDate: string }
    cargos: Array<{ description: string; cargoWeight: number; cargoType: number }>
    addtitionalInfo: string
  }) =>
    request<{ id: number }>('/Order/addOrder', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateOrder: (data: { orderId: number; status?: string; price?: number }) =>
    request<any>('/Order/updateOrder', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  cancelOrder: (orderId: number) =>
    request<any>('/Order/cancelOrder', {
      method: 'PUT',
      body: JSON.stringify({ orderId }),
    }),
  assignRoute: (data: {
    orderId: number
    driverId?: number
    startLocation: string
    endLocation: string
    stopPoints?: string
    deliveryDate: string
  }) =>
    request<any>('/Order/assignRoute', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getBySearch: (params: { SearchTerm?: string; StatusFilter?: string }) => {
    const query = new URLSearchParams()
    if (params.SearchTerm) query.set('SearchTerm', params.SearchTerm)
    if (params.StatusFilter) query.set('StatusFilter', params.StatusFilter)
    const qs = query.toString()
    return request<any[]>(`/Order/getOrderBySearch${qs ? `?${qs}` : ''}`)
  },
}

export const driversApi = {
  getAll: () =>
    request<any[]>('/Driver/getDriversList'),
  getBySearch: (params: { SearchTerm?: string; StatusFilter?: string }) => {
    const query = new URLSearchParams()
    if (params.SearchTerm) query.set('SearchTerm', params.SearchTerm)
    if (params.StatusFilter) query.set('StatusFilter', params.StatusFilter)
    const qs = query.toString()
    return request<any[]>(`/Driver/getDriversBySearch${qs ? `?${qs}` : ''}`)
  },
}

export const clientsApi = {
  getAll: () => request<any[]>('/Client/getUsers'),
}

export const dashboardApi = {
  getStats: () => request<any>('/dashboard'),
}
