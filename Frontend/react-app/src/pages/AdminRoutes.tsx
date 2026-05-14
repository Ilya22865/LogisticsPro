import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { ordersApi, driversApi } from '../api'

interface RoutePoint {
  id: number
  label: string
  lat: number
  lng: number
  address: string
  marker: L.Marker | null
}

interface OrderOption {
  orderId: number
  label: string
}

interface DriverOption {
  driverId: number
  label: string
}

const labels = ['A', 'B', 'C', 'D', 'E', 'F']

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function AdminRoutes() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const routingControl = useRef<L.Routing.Control | null>(null)
  const [points, setPoints] = useState<RoutePoint[]>([])
  const [routeDist, setRouteDist] = useState('— км')
  const [routeTime, setRouteTime] = useState('— ч')
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [orderSelect, setOrderSelect] = useState('')
  const [driverSelect, setDriverSelect] = useState('')
  const [routeDate, setRouteDate] = useState(() => new Date().toISOString().split('T')[0])
  const [showSuccess, setShowSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [orderOptions, setOrderOptions] = useState<OrderOption[]>([])
  const [driverOptions, setDriverOptions] = useState<DriverOption[]>([])

  const rebuildRouteRef = useRef<() => void>(() => {})
  const updateInfoRef = useRef<() => void>(() => {})

  const rebuildRoute = useCallback(() => {
    const map = mapInstance.current
    if (!map) return
    if (routingControl.current) { map.removeControl(routingControl.current); routingControl.current = null }
    const waypoints = points.map((p) => L.latLng(p.lat, p.lng))
    if (waypoints.length < 2) return
    routingControl.current = L.Routing.control({
      waypoints, routeWhileDragging: true, show: false, language: 'ru',
      lineOptions: { styles: [{ color: '#6688bc', opacity: 0.8, weight: 10 }] },
    } as any).addTo(map)
    routingControl.current.on('routesfound', (e: any) => {
      const s = e.routes[0].summary
      setRouteDist((s.totalDistance / 1000).toFixed(1) + ' км')
      setRouteTime((s.totalTime / 3600).toFixed(1) + ' ч')
    })
  }, [points])

  const updateInfo = useCallback(() => {
    if (points.length < 2) { setRouteDist('— км'); setRouteTime('— ч'); return }
    let total = 0
    for (let i = 1; i < points.length; i++) total += calculateDistance(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng)
    setRouteDist(total.toFixed(1) + ' км')
    setRouteTime((total / 80).toFixed(1) + ' ч')
  }, [points])

  rebuildRouteRef.current = rebuildRoute
  updateInfoRef.current = updateInfo

  useEffect(() => {
    ordersApi.getAllForAdmin().then((data: any[]) => {
      const opts = (data || [])
        .filter((o: any) => !o.driver)
        .map((o: any) => ({
          orderId: o.orderId,
          label: `#${o.orderId} — ${o.route ? `${o.route.startLocation || '?'} → ${o.route.endLocation || '?'}` : 'без маршрута'}`,
        }))
      setOrderOptions(opts)
    }).catch(() => {})

    driversApi.getAll().then((data: any[]) => {
      const opts = (data || [])
        .filter((d: any) => d.driverStatus === 'Inactive')
        .map((d: any) => ({
          driverId: d.driverId,
          label: `${d.driverFullName} (${d.truckModel || 'авто не указано'})`,
        }))
      setDriverOptions(opts)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const main = document.querySelector('.main-content') as HTMLElement
    if (!main) return
    const origPadding = main.style.padding
    main.style.padding = '0'
    return () => { main.style.padding = origPadding }
  }, [])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    const map = L.map(mapRef.current).setView([53.9, 27.56], 7)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      const count = document.querySelectorAll('.route-point').length
      const label = labels[count] || String(count + 1)
      const marker = L.marker([e.latlng.lat, e.latlng.lng], { draggable: true }).addTo(map)
      const point: RoutePoint = { id: Date.now(), label, lat: e.latlng.lat, lng: e.latlng.lng, address: 'Точка на карте', marker }
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        point.lat = pos.lat
        point.lng = pos.lng
        rebuildRouteRef.current()
        updateInfoRef.current()
      })
      setPoints((prev) => [...prev, point])
      setTimeout(() => { rebuildRouteRef.current(); updateInfoRef.current() }, 0)
    })

    mapInstance.current = map
    return () => { map.remove(); mapInstance.current = null }
  }, [])

  const removePoint = useCallback((pointId: number) => {
    const map = mapInstance.current
    setPoints((prev) => {
      const pt = prev.find((p) => p.id === pointId)
      if (pt?.marker && map) map.removeLayer(pt.marker)
      return prev.filter((p) => p.id !== pointId)
    })
    setTimeout(() => { rebuildRouteRef.current(); updateInfoRef.current() }, 0)
  }, [])

  const clearAllPoints = useCallback(() => {
    const map = mapInstance.current
    points.forEach((p) => { if (p.marker && map) map.removeLayer(p.marker) })
    setPoints([])
    setRouteDist('— км')
    setRouteTime('— ч')
    if (routingControl.current && map) { map.removeControl(routingControl.current); routingControl.current = null }
  }, [points])

  const saveRoute = async () => {
    if (points.length < 2) { alert('Добавьте минимум 2 точки маршрута'); return }
    if (!orderSelect) { alert('Выберите заказ'); return }
    if (!driverSelect) { alert('Выберите водителя'); return }
    setSaving(true)
    try {
      const first = points[0]
      const last = points[points.length - 1]
      const mids = points.slice(1, -1)
      const stopPoints = mids.length > 0
        ? mids.map((p) => `${p.lat},${p.lng}`).join(';')
        : undefined
      await ordersApi.assignRoute({
        orderId: Number(orderSelect),
        driverId: Number(driverSelect),
        startLocation: first.address || `Точка ${first.label}`,
        endLocation: last.address || `Точка ${last.label}`,
        stopPoints,
        deliveryDate: routeDate,
      })
      setShowSuccess(true)
      setTimeout(() => { setShowSuccess(false); clearAllPoints(); setOrderSelect(''); setDriverSelect('') }, 2000)
    } catch (e) {
      alert('Ошибка при сохранении маршрута')
      console.error(e)
    }
    setSaving(false)
  }

  return (
    <div className="routes-page">
      <div className="map-container">
        <div className="route-builder-panel" id="routeBuilderPanel">
          <div className="drag-handle" id="dragHandle" onClick={() => setPanelCollapsed(!panelCollapsed)}></div>
          <button className="panel-toggle-btn" id="panelToggleBtn" onClick={() => setPanelCollapsed(!panelCollapsed)} aria-label="Свернуть/Развернуть">
            <span className="toggle-icon">&#9650;</span>
          </button>

          <div className={`success-overlay ${showSuccess ? 'visible' : ''}`} id="successOverlay">
            <div className="success-icon">&#10003;</div>
            <div className="success-text">Маршрут сохранён!</div>
          </div>

          <div className="panel-header">
            <div className="header-icon">&#128205;</div>
            <h3>Построение маршрута</h3>
          </div>

          <div className="hint-box">
            <span className="hint-icon">&#128073;</span>
            <span>Кликните по карте, чтобы добавить точки маршрута</span>
          </div>

          <div className={`route-points-list ${points.length === 0 ? 'empty-state' : ''}`} id="routePointsList">
            {points.length === 0 ? (
              <>
                <div className="empty-icon">&#128506;</div>
                <div className="empty-text">Точки маршрута не добавлены.<br />Кликните по карте или нажмите «Добавить точку»</div>
              </>
            ) : (
              points.map((p, idx) => (
                <div className="route-point" key={p.id}>
                  <div className="route-point-marker">{p.label || labels[idx] || idx + 1}</div>
                  <div className="route-point-info">
                    <div className="route-point-address">{p.address || 'Точка на карте'}</div>
                  </div>
                  <button className="route-point-remove" onClick={() => removePoint(p.id)} aria-label="Удалить точку">&times;</button>
                </div>
              ))
            )}
          </div>

          <div className="route-actions">
            <button className="btn btn-primary" onClick={() => setPanelCollapsed(false)}>Добавить точку</button>
            <button className="btn btn-secondary" onClick={clearAllPoints}>Очистить</button>
          </div>

          <div className="route-info-box">
            <div className="route-info-item">
              <span className="route-info-label">&#128207; Расстояние:</span>
              <span className="route-info-value" id="routeDistance">{routeDist}</span>
            </div>
            <div className="route-info-item">
              <span className="route-info-label">&#9201; Время в пути:</span>
              <span className="route-info-value" id="routeTime">{routeTime}</span>
            </div>
            <div className="route-info-item">
              <span className="route-info-label">&#128205; Точек:</span>
              <span className="route-info-value" id="routePointsCount">{points.length}</span>
            </div>
          </div>

          <hr className="section-divider" />

          <h4 className="section-title">Привязка к заказу</h4>

          <div className="form-group">
            <label htmlFor="orderSelect">&#128203; Заказ</label>
            <select id="orderSelect" value={orderSelect} onChange={(e) => setOrderSelect(e.target.value)}>
              <option value="">Выберите заказ</option>
              {orderOptions.map((o) => (
                <option key={o.orderId} value={o.orderId}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="driverSelect">&#128100; Водитель</label>
            <select id="driverSelect" value={driverSelect} onChange={(e) => setDriverSelect(e.target.value)}>
              <option value="">Выберите водителя</option>
              {driverOptions.map((d) => (
                <option key={d.driverId} value={d.driverId}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="routeDate">&#128197; Дата отправления</label>
            <input type="date" id="routeDate" value={routeDate} onChange={(e) => setRouteDate(e.target.value)} />
          </div>

          <button className="save-route-btn" id="saveRouteBtn" onClick={saveRoute} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить маршрут'}
          </button>
        </div>

        <div ref={mapRef} id="adminMap" className="map-placeholder"></div>
      </div>
    </div>
  )
}
