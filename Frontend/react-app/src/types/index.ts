export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'driver' | 'client'
}

export interface AuthResponse {
  token: string
  user: User
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  registerType: 'company' | 'staff'
  staffCode?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface Order {
  id: number
  userId: number
  clientName?: string
  routeId?: number
  status: string
  createdAt: string
  additionalInfo?: string
  startLocation?: string
  endLocation?: string
  deliveryDate?: string
  cargoDescription?: string
  cargoWeight?: number
  cargoType?: string
}

export interface Route {
  id: number
  startLocation: string
  endLocation: string
  deliveryDate: string
  driverId?: number
  driverName?: string
  status: string
}

export interface Cargo {
  description: string
  cargoWeight: number
  cargoType: string
}

export interface CreateOrderPayload {
  route: {
    startLocation: string
    endLocation: string
    deliveryDate: string
  }
  cargos: Cargo[]
  additionalInfo: string
}

export interface Driver {
  id: number
  username: string
  email: string
  status: string
  rating?: number
  completedOrders?: number
}

export interface Client {
  id: number
  username: string
  email: string
  companyName?: string
  phone?: string
  totalOrders?: number
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  activeOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalDrivers: number
  freeDrivers: number
  totalClients: number
  revenue: number
  recentOrders: Array<{
    orderId: number
    orderStatus: string
    price: number
    user?: { fullName?: string }
    route?: { startLocation?: string; endLocation?: string }
    driver?: { fullName?: string }
  }>
}
