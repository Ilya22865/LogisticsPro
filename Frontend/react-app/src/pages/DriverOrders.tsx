import { useState, useEffect } from 'react'
import { ordersApi } from '../api'

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

export default function DriverOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const data = await ordersApi.getMy()
      setOrders(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleCancel(orderId: number) {
    if (!confirm('Вы уверены, что хотите отменить заказ?')) return
    setCancelling(orderId)
    try {
      await ordersApi.cancelOrder(orderId)
      loadOrders()
    } catch (e) {
      alert('Не удалось отменить заказ')
      console.error(e)
    }
    setCancelling(null)
  }

  const canCancel = (status?: string) => status === 'Pending' || status === 'InTransit'

  return (
    <>
      <div className="page-header">
        <h1>Мои заказы</h1>
        <p>Просмотр ваших заказов в системе</p>
      </div>

      <div className="table-container fade-in">
        <div className="table-header">
          <h2>Заказы</h2>
        </div>
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
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="loading-spinner"></div>
                    <div>Загрузка заказов...</div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
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
                      <td data-label="Действия">
                        {canCancel(status) ? (
                          <button
                            className="btn btn-sm"
                            onClick={() => handleCancel(o.orderId)}
                            disabled={cancelling === o.orderId}
                            style={{ padding: '4px 12px', fontSize: 13, background: '#d9534f', color: '#fff', border: 'none', borderRadius: 6 }}
                          >
                            {cancelling === o.orderId ? '...' : 'Отменить'}
                          </button>
                        ) : (
                          <span style={{ color: '#999', fontSize: 12 }}>—</span>
                        )}
                      </td>
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
