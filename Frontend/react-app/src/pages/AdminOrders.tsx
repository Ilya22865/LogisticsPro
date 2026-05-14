import { useState, useEffect } from 'react'
import { ordersApi } from '../api'

const ORDER_STATUSES = ['Pending', 'InTransit', 'Delivered', 'Cancelled']

const statusTextMap: Record<string, string> = {
  pending: 'Ожидание',
  intransit: 'В пути',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}
const statusFilterOptions = [
  { value: '', label: 'Все статусы' },
  ...ORDER_STATUSES.map((s) => ({
    value: s,
    label: statusTextMap[s.toLowerCase()] || s,
  })),
]

function formatDate(d: string | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU')
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await ordersApi.getAllForAdmin()
      setOrders(data || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(doFilter, 500)
    return () => clearTimeout(t)
  }, [search, statusFilter])

  async function doFilter() {
    if (!search && !statusFilter) {
      loadOrders()
      return
    }
    try {
      const data = await ordersApi.getBySearch({
        SearchTerm: search || undefined,
        StatusFilter: statusFilter || undefined,
      })
      setOrders(data || [])
    } catch (e) {
      console.error(e)
    }
  }

  function startEdit(order: any) {
    setEditingId(order.orderId)
    setEditStatus(order.orderStatus || 'Pending')
    setEditPrice(order.price != null ? String(order.price) : '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(orderId: number) {
    setSaving(true)
    try {
      const payload: any = { orderId }
      if (editStatus) payload.status = editStatus
      const priceNum = parseFloat(editPrice)
      if (!isNaN(priceNum)) payload.price = priceNum
      await ordersApi.updateOrder(payload)
      setEditingId(null)
      loadOrders()
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  return (
    <>
      <div className="page-header">
        <h1>Все заказы</h1>
        <p>Управление всеми заказами системы</p>
      </div>

      <div className="table-container fade-in filters-panel" style={{ marginBottom: 30 }}>
        <div className="filters-wrapper">
          <div className="form-group">
            <label htmlFor="statusFilter"></label>
            <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statusFilterOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="searchOrder">Поиск</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                id="searchOrder"
                placeholder="№ заказа, клиент, маршрут..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className={`search-clear-btn ${search ? 'visible' : ''}`}
                onClick={() => { setSearch(''); setStatusFilter('') }}
                aria-label="Очистить поиск"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container fade-in">
        <div className="table-header">
          <h2>Заказы</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table id="ordersTable" className="orders-table-card">
            <thead>
              <tr>
                <th>№ заказа</th>
                <th>Клиент</th>
                <th>Маршрут</th>
                <th>Груз</th>
                <th>Статус</th>
                <th>Дата доставки</th>
                <th>Стоимость</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="loading-row" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner"></div>
                    <div>Загрузка заказов...</div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon"></div>
                      <p>Заказы не найдены</p>
                      <small>В системе пока нет зарегистрированных заказов</small>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const routeText = order.route?.startLocation && order.route?.endLocation
                    ? `${order.route.startLocation} → ${order.route.endLocation}`
                    : '—'
                  const cargo = order.cargos?.[0]
                  const cargoText = cargo
                    ? `${cargo.cargoType || ''}, ${cargo.cargoWeight || ''} кг`
                    : '—'
                  const isEditing = editingId === order.orderId

                  return (
                    <tr key={order.orderId}>
                      <td data-label="№ заказа">{order.orderId}</td>
                      <td data-label="Клиент">{order.user?.fullName || '—'}</td>
                      <td data-label="Маршрут">{routeText}</td>
                      <td data-label="Груз">{cargoText}</td>
                      <td data-label="Статус">
                        {isEditing ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc' }}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>{statusTextMap[s.toLowerCase()] || s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`status-badge ${order.orderStatus?.toLowerCase() === 'intransit' ? 'in-transit' : order.orderStatus?.toLowerCase() || ''}`}>
                            <span className="status-dot"></span>
                            {statusTextMap[order.orderStatus?.toLowerCase()] || order.orderStatus || '—'}
                          </span>
                        )}
                      </td>
                      <td data-label="Дата доставки">{formatDate(order.route?.deliveryDate)}</td>
                      <td data-label="Стоимость">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            style={{ width: 120, padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc' }}
                            placeholder="0.00"
                          />
                        ) : (
                          order.price != null && order.price > 0
                            ? `${order.price.toLocaleString('ru-RU')} BYN`
                            : '—'
                        )}
                      </td>
                      <td data-label="Действия">
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => saveEdit(order.orderId)}
                              disabled={saving}
                              style={{ padding: '4px 12px', fontSize: 13 }}
                            >
                              {saving ? '...' : 'Сохранить'}
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={cancelEdit}
                              style={{ padding: '4px 12px', fontSize: 13, background: '#6c757d', color: '#fff', border: 'none', borderRadius: 6 }}
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm"
                            onClick={() => startEdit(order)}
                            style={{ padding: '4px 12px', fontSize: 13, background: '#395886', color: '#fff', border: 'none', borderRadius: 6 }}
                          >
                            Редактировать
                          </button>
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
