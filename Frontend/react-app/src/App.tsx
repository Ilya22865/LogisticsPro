import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './pages/Layout'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import AdminDashboard from './pages/AdminDashboard'
import AdminOrders from './pages/AdminOrders'
import AdminRoutes from './pages/AdminRoutes'
import AdminDrivers from './pages/AdminDrivers'
import AdminClients from './pages/AdminClients'
import DriverDashboard from './pages/DriverDashboard'
import CreateOrder from './pages/CreateOrder'
import DriverOrders from './pages/DriverOrders'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/routes" element={<AdminRoute><AdminRoutes /></AdminRoute>} />
        <Route path="/admin/drivers" element={<AdminRoute><AdminDrivers /></AdminRoute>} />
        <Route path="/admin/clients" element={<AdminRoute><AdminClients /></AdminRoute>} />
        <Route path="/dashboard" element={<DriverDashboard />} />
        <Route path="/orders" element={<DriverOrders />} />
        <Route path="/create-order" element={<CreateOrder />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
