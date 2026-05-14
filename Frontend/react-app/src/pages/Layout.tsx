import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCallback } from 'react'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()

  const toggleSidebar = useCallback(() => {
    const sidebar = document.querySelector('.sidebar')
    const menuToggle = document.querySelector('.menu-toggle')
    sidebar?.classList.toggle('active')
    menuToggle?.classList.toggle('active')
    const existing = document.getElementById('sidebarOverlay')
    if (existing) {
      existing.remove()
    } else {
      const overlay = document.createElement('div')
      overlay.id = 'sidebarOverlay'
      overlay.className = 'sidebar-overlay'
      overlay.onclick = toggleSidebar
      document.body.appendChild(overlay)
    }
  }, [])

  const roleLabel = isAdmin ? 'Администратор' : user?.role === 'driver' ? 'Водитель' : 'Клиент'
  const companyName = isAdmin ? 'Логистическая компания' : user?.username || ''

  return (
    <div className="app-layout">
      <button className="menu-toggle" onClick={toggleSidebar} aria-label="Меню">
        <span></span><span></span><span></span>
      </button>

      <aside className="sidebar">
        <div className="sidebar-header">
          <h2><i className="fas fa-truck" style={{ marginRight: 8 }}></i>LogisticsPro</h2>
          <span className="role-badge">{roleLabel}</span>
        </div>

        <ul className="sidebar-menu">
          {isAdmin ? (
            <>
              <li><NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}><i className="fas fa-chart-pie"></i> Дашборд</NavLink></li>
              <li><NavLink to="/admin/routes" className={({ isActive }) => isActive ? 'active' : ''}><i className="fas fa-route"></i> Построение маршрутов</NavLink></li>
              <li><NavLink to="/admin/drivers" className={({ isActive }) => isActive ? 'active' : ''}><i className="fas fa-users"></i> Водители</NavLink></li>
              <li><NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}><i className="fas fa-clipboard-list"></i> Все заказы</NavLink></li>
              <li><NavLink to="/admin/clients" className={({ isActive }) => isActive ? 'active' : ''}><i className="fas fa-building"></i> Клиенты</NavLink></li>
            </>
          ) : (
            <>
              <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}><i className="fas fa-chart-line"></i> Дашборд</NavLink></li>
              <li><NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}><i className="fas fa-box"></i> Мои заказы</NavLink></li>
              <li><NavLink to="/create-order" className={({ isActive }) => isActive ? 'active' : ''}><i className="fas fa-plus-circle"></i> Создать заказ</NavLink></li>
            </>
          )}
        </ul>

        <div className="sidebar-user">
          <div className="user-info">
            <div className="avatar" id="userAvatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h4 id={isAdmin ? 'adminName' : 'userName'}>{user?.username || 'Пользователь'}</h4>
              <p id={isAdmin ? 'adminCompany' : 'userCompany'}>{companyName}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i> Выйти
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div id="alertContainer"></div>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
