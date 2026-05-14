import { useState, useEffect } from 'react'
import { driversApi } from '../api'

interface DriverItem {
  driverId: number
  driverFullName: string
  driverPhoneNumber: string
  truckModel?: string
  truckRegisterNumber?: string
  driverStatus: string
  route?: { startLocation?: string; endLocation?: string }
}

function formatPhone(phone: string): string {
  if (phone.startsWith('+375') && phone.length === 13) {
    return `+375 ${phone.slice(4, 6)} ${phone.slice(6, 9)}-${phone.slice(9, 11)}-${phone.slice(11, 13)}`
  }
  return phone
}

const statusTextMap: Record<string, string> = {
  Active: 'На линии',
  Inactive: 'Свободен',
  On_leave: 'В отпуске',
}

const statusClassMap: Record<string, string> = {
  Active: 'on-line',
  Inactive: 'off-line',
  On_leave: 'on-vacation',
}

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<DriverItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState({ total: 0, onLine: 0, inactive: 0, onLeave: 0 })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const data = await driversApi.getAll()
      setDrivers(data || [])
      computeStats(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function computeStats(list: DriverItem[]) {
    setStats({
      total: list.length,
      onLine: list.filter((d) => d.driverStatus === 'Active').length,
      inactive: list.filter((d) => d.driverStatus === 'Inactive').length,
      onLeave: list.filter((d) => d.driverStatus === 'On_leave').length,
    })
  }

  useEffect(() => {
    const t = setTimeout(doFilter, 500)
    return () => clearTimeout(t)
  }, [search, statusFilter])

  async function doFilter() {
    if ((statusFilter === 'all' || !statusFilter) && !search) { loadData(); return }
    try {
      const data = await driversApi.getBySearch({
        SearchTerm: search || undefined,
        StatusFilter: statusFilter !== 'all' ? statusFilter : undefined,
      })
      setDrivers(data || [])
      computeStats(data || [])
    } catch (e) { console.error(e) }
  }

  return (
    <>
      <div className="page-header">
        <h1>Водители</h1>
        <p>Управление водителями и их статусами</p>
      </div>

      <div className="cards-grid" style={{ marginBottom: 30 }}>
        <div className="card fade-in">
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-users"></i></div>
            <h3>Всего водителей</h3>
          </div>
          <div className="value">{stats.total}</div>
          <div className="description">зарегистрировано</div>
        </div>
        <div className="card card-green fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-user-check"></i></div>
            <h3>На линии</h3>
          </div>
          <div className="value">{stats.onLine}</div>
          <div className="description">выполняют заказы</div>
        </div>
        <div className="card card-warm fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-user-clock"></i></div>
            <h3>Свободны</h3>
          </div>
          <div className="value">{stats.inactive}</div>
          <div className="description">ожидают назначения</div>
        </div>
        <div className="card card-purple fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="card-header">
            <div className="card-icon"><i className="fas fa-user-minus"></i></div>
            <h3>В отпуске</h3>
          </div>
          <div className="value">{stats.onLeave}</div>
          <div className="description">временно не работают</div>
        </div>
      </div>

      <div className="table-container fade-in filters-panel" style={{ marginBottom: 30 }}>
        <div className="filters-wrapper">
          <div className="form-group">
            <label htmlFor="driverStatusFilterSelect">Статус</label>
            <select id="driverStatusFilterSelect" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Все статусы</option>
              <option value="Active">На линии</option>
              <option value="Inactive">Свободен</option>
              <option value="On_leave">В отпуске</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="searchDriverInput">Поиск</label>
            <div className="search-input-wrapper">
              <input
                type="text" id="searchDriverInput"
                placeholder="ФИО, телефон, автомобиль..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className={`search-clear-btn ${search ? 'visible' : ''}`}
                onClick={() => setSearch('')}
                aria-label="Очистить поиск"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container fade-in">
        <div className="table-header">
          <h2>Водители</h2>
          <span id="driverCount">{stats.total} {stats.total === 1 ? 'запись' : stats.total >= 2 && stats.total <= 4 ? 'записи' : 'записей'}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table id="driversTable">
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Телефон</th>
                <th>Автомобиль</th>
                <th>Госномер</th>
                <th>Статус</th>
                <th>Текущий маршрут</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="loading-spinner"></div>
                    <div>Загрузка водителей...</div>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="empty-state">
                      <div className="empty-state-icon"></div>
                      <p>Водители не найдены</p>
                      <small>В системе пока нет зарегистрированных водителей</small>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((d) => {
                  const routeInfo = d.route?.startLocation && d.route?.endLocation ? `${d.route.startLocation} → ${d.route.endLocation}` : 'Нет маршрута'
                  return (
                    <tr key={d.driverId}>
                      <td data-label="ФИО">{d.driverFullName}</td>
                      <td data-label="Телефон">{formatPhone(d.driverPhoneNumber)}</td>
                      <td data-label="Автомобиль">{d.truckModel || '—'}</td>
                      <td data-label="Госномер">{d.truckRegisterNumber || '—'}</td>
                      <td data-label="Статус">
                        <span className={`status-badge ${statusClassMap[d.driverStatus] || ''}`}>
                          {statusTextMap[d.driverStatus] || d.driverStatus}
                        </span>
                      </td>
                      <td data-label="Текущий маршрут">{routeInfo}</td>
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
