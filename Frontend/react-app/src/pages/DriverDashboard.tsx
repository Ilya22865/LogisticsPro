import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { ordersApi } from '../api'
import { useAuth } from '../contexts/AuthContext'

interface OrderItem {
  orderId: number
  route?: { startLocation?: string; endLocation?: string; deliveryDate?: string }
  cargos?: Array<{ cargoType?: string; cargoWeight?: number }>
  orderStatus?: string
  price?: number
}

const statusClassMap: Record<string, string> = {
  pending: 'pending',
  intransit: 'in-transit',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

const statusTextMap: Record<string, string> = {
  pending: 'Ожидание',
  intransit: 'В пути',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

export default function DriverDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement>(null)
  const [orders, setOrders] = useState<OrderItem[]>([])

  useEffect(() => {
    ordersApi.getMy().then((data) => setOrders(data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const map = L.map(mapRef.current).setView([53.9, 27.56], 7)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    return () => { map.remove() }
  }, [])

  const now = new Date()
  const hours = now.getHours()
  const greeting = hours < 12 ? 'Доброе утро' : hours < 18 ? 'Добрый день' : 'Добрый вечер'
  const timeStr = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'InTransit').length
    const inDelivery = orders.filter((o) => o.orderStatus === 'InTransit').length
    const completed = orders.filter((o) => o.orderStatus === 'Delivered').length
    return { active, inDelivery, completed }
  }, [orders])

  return (
    <>
      <div className="welcome-banner">
        <h2>
          {greeting}, {user?.username || 'Пользователь'}! <span className="wave-emoji">&#x1F44B;</span>
        </h2>
        <p>Рады видеть вас в системе управления логистикой</p>
        <div className="welcome-time">{timeStr}</div>
      </div>

      <div className="quick-actions">
        <button className="quick-action-btn warm" onClick={() => navigate('/create-order')}>
          <span>Создать заказ</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/orders')}>
          <i className="fas fa-list"></i>
          <span>Мои заказы</span>
        </button>
      </div>

      <div className="cards-grid" style={{ marginBottom: 25 }}>
        <div className="card card-warm fade-in">
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-box"></i></div>
            <h3>Активные заказы</h3>
          </div>
          <div className="value">{stats.active}</div>
          <div className="description">в работе</div>
        </div>
        <div className="card card-green fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-truck-moving"></i></div>
            <h3>В доставке</h3>
          </div>
          <div className="value">{stats.inDelivery}</div>
          <div className="description">сегодня</div>
        </div>
        <div className="card card-purple fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-check-circle"></i></div>
            <h3>Выполнено</h3>
          </div>
          <div className="value">{stats.completed}</div>
          <div className="description">за всё время</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 15 }}>Карта грузов</h2>
      <div ref={mapRef} id="userMap" style={{ width: '100%', height: 500, borderRadius: 'var(--border-radius-lg)', marginBottom: 25 }} />

      <h2 style={{ marginBottom: 15 }}>Мои заказы</h2>
      <div className="table-container fade-in">
        <div style={{ overflowX: 'auto' }}>
          <table id="ordersUserTable">
            <thead>
              <tr>
                <th>№</th>
                <th>Маршрут</th>
                <th>Груз</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="empty-state">
                      <div className="empty-state-icon"></div>
                      <p>Заказы не найдены</p>
                      <small>У вас пока нет заказов</small>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const routeText = o.route?.startLocation && o.route?.endLocation
                    ? `${o.route.startLocation} → ${o.route.endLocation}`
                    : '—'
                  const cargo = o.cargos?.[0]
                  const cargoText = cargo ? `${cargo.cargoType || ''}, ${cargo.cargoWeight || ''} кг` : '—'
                  const status = o.orderStatus || ''
                  const statusKey = status.toLowerCase()
                  return (
                    <tr key={o.orderId}>
                      <td data-label="№">{o.orderId}</td>
                      <td data-label="Маршрут">{routeText}</td>
                      <td data-label="Груз">{cargoText}</td>
                      <td data-label="Статус">
                        <span className={`status-badge ${statusClassMap[statusKey] || ''}`}>
                          <span className="status-dot"></span>
                          {statusTextMap[statusKey] || status}
                        </span>
                      </td>
                      <td data-label="Дата">{o.route?.deliveryDate ? new Date(o.route.deliveryDate).toLocaleDateString('ru-RU') : '—'}</td>
                      <td data-label="Стоимость">{o.price ? `${o.price} BYN` : '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
