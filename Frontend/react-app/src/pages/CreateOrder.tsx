import { useState, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersApi } from '../api'

export default function CreateOrder() {
  const navigate = useNavigate()

  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [cargoDescription, setCargoDescription] = useState('')
  const [weight, setWeight] = useState('')
  const [cargoType, setCargoType] = useState(0)
  const [addtitionalInfo, setAddtitionalInfo] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const section1Filled = startLocation.trim() && endLocation.trim()
  const section2Filled = cargoDescription.trim() && weight && parseFloat(weight) > 0

  function getActiveSection(): number {
    if (!section1Filled) return 1
    if (!section2Filled) return 2
    return 3
  }

  function validate(): boolean {
    if (!startLocation.trim() || !endLocation.trim()) return false
    if (!cargoDescription.trim() || !weight || parseFloat(weight) <= 0) return false
    return true
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) { setError('Заполните все обязательные поля'); return }
    setLoading(true)
    try {
      await ordersApi.create({
        route: {
          startLocation,
          endLocation,
          deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : '',
        },
        cargos: [{ description: cargoDescription, cargoWeight: parseFloat(weight), cargoType }],
        addtitionalInfo,
      })
      setSuccess(true)
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании заказа')
    }
    setLoading(false)
  }

  function handleCancel() { setShowCancelDialog(true) }

  const confirmCancel = useCallback(() => {
    setShowCancelDialog(false)
    navigate('/orders')
  }, [navigate])

  return (
    <>
      <div className="page-header">
        <h1><i className="fas fa-plus-circle" style={{ color: 'var(--color-primary)', marginRight: 10 }}></i>Новый заказ</h1>
        <p>Заполните информацию о грузе и маршруте</p>
      </div>

      <div className="step-indicator" id="stepIndicator">
        <div className={`step${section1Filled ? ' completed' : ''}${getActiveSection() === 1 ? ' active' : ''}`} data-step="1">
          <div className="step-circle">
            <span className="step-number">1</span>
            <i className="fas fa-route step-icon"></i>
            <i className="fas fa-check step-check"></i>
          </div>
          <span className="step-label">Маршрут</span>
        </div>
        <div className={`step${section2Filled ? ' completed' : ''}${getActiveSection() === 2 ? ' active' : ''}`} data-step="2">
          <div className="step-circle">
            <span className="step-number">2</span>
            <i className="fas fa-box-open step-icon"></i>
            <i className="fas fa-check step-check"></i>
          </div>
          <span className="step-label">Груз</span>
        </div>
        <div className={`step${getActiveSection() === 3 ? ' active' : ''}`} data-step="3">
          <div className="step-circle">
            <span className="step-number">3</span>
            <i className="fas fa-clipboard-list step-icon"></i>
            <i className="fas fa-check step-check"></i>
          </div>
          <span className="step-label">Детали</span>
        </div>
      </div>

      <div className="form-hint fade-in">
        <div className="hint-icon"><i className="fas fa-info-circle"></i></div>
        <div>
          <strong>Обратите внимание:</strong> Все поля, отмеченные звездочкой (*), обязательны для заполнения.
          После создания заказа менеджер свяжется с вами для подтверждения деталей.
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="order-form-container fade-in">
        <form id="orderForm" onSubmit={handleSubmit} noValidate>
          <div className={`form-section${getActiveSection() === 1 ? ' active-section' : ''}`} data-section="1">
            <h3>
              <span className="section-icon"><i className="fas fa-route"></i></span>
              <span className="section-title-text">Информация о маршруте</span>
            </h3>

            <div className="form-row">
              <div className="form-group">
                <div className="field-label">Точка отправления *</div>
                <input type="text" id="startLocation" placeholder="Город, адрес" required
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)} />
                <div className="error-message" style={{ display: error && !startLocation.trim() ? 'flex' : 'none' }}>
                  <i className="fas fa-exclamation-circle"></i> <span>Укажите точку отправления</span>
                </div>
              </div>

              <div className="form-group">
                <div className="field-label">Точка назначения *</div>
                <input type="text" id="endLocation" placeholder="Город, адрес" required
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)} />
                <div className="error-message" style={{ display: error && !endLocation.trim() ? 'flex' : 'none' }}>
                  <i className="fas fa-exclamation-circle"></i> <span>Укажите точку назначения</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="field-label">Желаемая дата доставки</div>
              <input type="date" id="deliveryDate"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)} />
            </div>
          </div>

          <div className={`form-section${getActiveSection() === 2 ? ' active-section' : ''}`} data-section="2">
            <h3>
              <span className="section-icon"><i className="fas fa-box-open"></i></span>
              <span className="section-title-text">Информация о грузе</span>
            </h3>

            <div className="form-group">
              <div className="field-label">Описание груза *</div>
              <input type="text" id="cargoDescription" placeholder="Например: Электроника, запчасти, мебель" required
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)} />
              <div className="error-message" style={{ display: error && !cargoDescription.trim() ? 'flex' : 'none' }}>
                <i className="fas fa-exclamation-circle"></i> <span>Укажите описание груза</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="field-label">Вес (кг) *</div>
                <input type="number" id="weight" placeholder="0" min="0.1" step="0.1" required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)} />
                <div className="error-message" style={{ display: error && (!weight || parseFloat(weight) <= 0) ? 'flex' : 'none' }}>
                  <i className="fas fa-exclamation-circle"></i> <span>Укажите корректный вес</span>
                </div>
              </div>

              <div className="form-group">
                <div className="field-label">Тип груза</div>
                <select id="cargoType" value={cargoType} onChange={(e) => setCargoType(Number(e.target.value))}>
                  <option value={0}>Обычный</option>
                  <option value={1}>Сыпучий</option>
                  <option value={2}>Жидкий</option>
                  <option value={3}>Хрупкий</option>
                  <option value={4}>Опасный</option>
                  <option value={5}>Скоропортящийся</option>
                  <option value={6}>Другой</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`form-section${getActiveSection() === 3 ? ' active-section' : ''}`} data-section="3">
            <h3>
              <span className="section-icon"><i className="fas fa-clipboard-list"></i></span>
              <span className="section-title-text">Детали заказа</span>
            </h3>

            <div className="form-group">
              <div className="field-label">Комментарий к заказу</div>
              <input type="text" id="notes" placeholder="Дополнительная информация, пожелания"
                value={addtitionalInfo}
                onChange={(e) => setAddtitionalInfo(e.target.value)} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit-primary" id="submitBtn" disabled={loading}>
              <span className="spinner" style={{ display: loading ? 'block' : 'none' }}></span>
              <i className="fas fa-check-circle btn-text"></i>
              <span className="btn-text">{loading ? 'Сохранение...' : 'Создать заказ'}</span>
            </button>
            <button type="button" className="btn-cancel-secondary" onClick={handleCancel}>
              <i className="fas fa-times-circle"></i> Отмена
            </button>
          </div>
        </form>
      </div>

      <div style={{
        position: 'fixed', top: 24, right: 24, zIndex: 10000,
        display: success ? 'flex' : 'none', alignItems: 'center', gap: 10,
        background: 'linear-gradient(135deg, #28a745, #34d058)', color: '#fff',
        padding: '14px 22px', borderRadius: 12, boxShadow: '0 6px 24px rgba(40,167,69,0.35)',
        fontSize: 15, fontWeight: 600, animation: 'slideDown 0.3s ease',
      }}>
        <i className="fas fa-check-circle" style={{ fontSize: 20 }}></i>
        Заказ успешно создан!
      </div>

      <div className={`confirm-dialog${showCancelDialog ? ' show' : ''}`} id="cancelDialog"
        onClick={(e) => { if (e.target === e.currentTarget) setShowCancelDialog(false) }}>
        <div className="confirm-dialog-content">
          <div className="dialog-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Отменить создание заказа?</h3>
          <p>Все введённые данные будут потеряны</p>
          <div className="confirm-dialog-actions">
            <button className="btn-confirm-no" onClick={() => setShowCancelDialog(false)}>Продолжить заполнение</button>
            <button className="btn-confirm-yes" onClick={confirmCancel}>Да, отменить</button>
          </div>
        </div>
      </div>
    </>
  )
}
