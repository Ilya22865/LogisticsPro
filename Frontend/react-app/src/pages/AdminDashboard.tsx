import { useState, useEffect, useMemo } from 'react'
import { dashboardApi, ordersApi } from '../api'
import type { DashboardStats } from '../types'

const statusText: Record<string, string> = {
  Pending: 'Ожидание',
  InTransit: 'В пути',
  Delivered: 'Доставлен',
  Cancelled: 'Отменён',
}

function formatDate(d: string | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU')
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      ordersApi.getAllForAdmin(),
    ]).then(([dashData]) => {
      setStats(dashData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const now = new Date()
  const hours = now.getHours()
  const greeting = hours < 12 ? 'Доброе утро' : hours < 18 ? 'Добрый день' : 'Добрый вечер'
  const timeStr = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const total = stats ? stats.totalOrders : 0
  const pending = stats?.pendingOrders ?? 0
  const active = stats?.activeOrders ?? 0
  const delivered = stats?.deliveredOrders ?? 0
  const cancelled = stats?.cancelledOrders ?? 0
  const pendingPct = total > 0 ? (pending / total * 100) : 0
  const activePct = total > 0 ? (active / total * 100) : 0
  const deliveredPct = total > 0 ? (delivered / total * 100) : 0
  const cancelledPct = total > 0 ? (cancelled / total * 100) : 0

  const conicGradient = useMemo(() => {
    if (total === 0) return ''
    const parts: string[] = []
    let start = 0
    const segments = [
      { pct: pendingPct, color: '#f0ad4e' },
      { pct: activePct, color: '#5bc0de' },
      { pct: deliveredPct, color: '#5cb85c' },
      { pct: cancelledPct, color: '#d9534f' },
    ]
    for (const s of segments) {
      if (s.pct > 0) {
        const end = start + s.pct * 3.6
        parts.push(`${s.color} ${start}deg ${end}deg`)
        start = end
      }
    }
    return `conic-gradient(${parts.join(', ')})`
  }, [pendingPct, activePct, deliveredPct, cancelledPct, total])

  if (loading) {
    return (
      <>
        <h1>Панель управления</h1>
        <div className="cards-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card skeleton">&nbsp;</div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="welcome-banner">
        <h2>{greeting}, Администратор! <span className="wave-emoji">&#x1F44B;</span></h2>
        <p>Панель управления логистической системой</p>
        <div className="welcome-time">{timeStr}</div>
      </div>

      <div className="cards-grid">
        <div className="card fade-in">
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-shopping-cart"></i></div>
            <h3>Всего заказов</h3>
          </div>
          <div className="value">{total}</div>
          <div className="description">в системе</div>
        </div>
        <div className="card card-warm fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-truck"></i></div>
            <h3>В пути</h3>
          </div>
          <div className="value">{active}</div>
          <div className="description">{total > 0 ? `${activePct.toFixed(0)}% от всех` : '—'}</div>
        </div>
        <div className="card card-green fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-check-circle"></i></div>
            <h3>Доставлено</h3>
          </div>
          <div className="value">{delivered}</div>
          <div className="description">{stats?.revenue ? `${stats.revenue.toLocaleString('ru-RU')} BYN` : '—'}</div>
        </div>
        <div className="card fade-in" style={{ animationDelay: '0.3s', borderLeft: '4px solid #5bc0de' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-clock"></i></div>
            <h3>Ожидают</h3>
          </div>
          <div className="value">{pending}</div>
          <div className="description">требуют назначения</div>
        </div>
        <div className="card fade-in" style={{ animationDelay: '0.4s', borderLeft: '4px solid #d9534f' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-ban"></i></div>
            <h3>Отменено</h3>
          </div>
          <div className="value">{cancelled}</div>
          <div className="description">заказов отменено</div>
        </div>
        <div className="card card-purple fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-users"></i></div>
            <h3>Водители</h3>
          </div>
          <div className="value">{stats?.totalDrivers ?? '—'}</div>
          <div className="description">{stats?.freeDrivers ?? '—'} свободных</div>
        </div>
      </div>

      <div className="cards-grid" style={{ marginTop: 10, gridTemplateColumns: '1fr 1fr' }}>
        <div className="card fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-building"></i></div>
            <h3>Клиенты</h3>
          </div>
          <div className="value">{stats?.totalClients ?? '—'}</div>
          <div className="description">зарегистрировано</div>
        </div>
        <div className="card fade-in" style={{ animationDelay: '0.7s', borderLeft: '4px solid #f0ad4e' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-dollar-sign"></i></div>
            <h3>Выручка</h3>
          </div>
          <div className="value">{stats?.revenue ? `${stats.revenue.toLocaleString('ru-RU')} BYN` : '0 BYN'}</div>
          <div className="description">за доставленные заказы</div>
        </div>
        <div className="card fade-in" style={{ gridColumn: '1 / 2' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-chart-pie"></i></div>
            <h3>Распределение заказов</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '10px 0' }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: total > 0 ? conicGradient : '#eee',
              flexShrink: 0,
            }}></div>
            <div style={{ flex: 1 }}>
              {[
                { label: 'Ожидание', color: '#f0ad4e', count: pending },
                { label: 'В пути', color: '#5bc0de', count: active },
                { label: 'Доставлено', color: '#5cb85c', count: delivered },
                { label: 'Отменено', color: '#d9534f', count: cancelled },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, flexShrink: 0 }}></div>
                  <span style={{ flex: 1, color: '#555' }}>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card fade-in" style={{ gridColumn: '2 / 3' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-history"></i></div>
            <h3>Последние заказы</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="orders-table-card" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #eee' }}>№</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Клиент</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Маршрут</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Статус</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Цена</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.length ? stats.recentOrders.map((o) => (
                  <tr key={o.orderId}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0' }}>#{o.orderId}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0' }}>{o.user?.fullName || '—'}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                      {o.route ? `${o.route.startLocation || '?'} → ${o.route.endLocation || '?'}` : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0' }}>
                      <span className={`status-badge ${o.orderStatus?.toLowerCase() === 'intransit' ? 'in-transit' : o.orderStatus?.toLowerCase() || ''}`}>
                        <span className="status-dot"></span>
                        {statusText[o.orderStatus || ''] || o.orderStatus || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>
                      {o.price > 0 ? `${o.price.toLocaleString('ru-RU')} BYN` : '—'}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#999' }}>Нет заказов</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
