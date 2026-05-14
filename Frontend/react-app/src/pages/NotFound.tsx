import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1>404</h1>
      <p>Страница не найдена</p>
      <Link to="/dashboard" className="btn-primary">
        Вернуться на дашборд
      </Link>
    </div>
  )
}
