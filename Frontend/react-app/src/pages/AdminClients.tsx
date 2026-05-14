import { useState, useEffect } from 'react'
import { clientsApi } from '../api'

interface ClientItem {
  userId: number
  fullName: string
  email: string
  nameOfCompany?: string
  amountOfOrders: number
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clientsApi.getAll().then((data) => {
      setClients(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <h1>Клиенты</h1>
        <p>Список зарегистрированных клиентов системы</p>
      </div>

      <div className="table-container fade-in">
        <div className="table-header">
          <h2>Клиенты</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table id="clientsTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Компания</th>
                <th>Количество заказов</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="loading-spinner"></div>
                    <div>Загрузка клиентов...</div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="empty-state">
                      <div className="empty-state-icon"></div>
                      <p>Клиенты не найдены</p>
                      <small>В системе пока нет зарегистрированных клиентов</small>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.userId}>
                    <td data-label="ID">{c.userId}</td>
                    <td data-label="Имя">{c.fullName}</td>
                    <td data-label="Email">{c.email}</td>
                    <td data-label="Компания">{c.nameOfCompany || '—'}</td>
                    <td data-label="Количество заказов">{c.amountOfOrders || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
