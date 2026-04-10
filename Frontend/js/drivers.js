const API_BASE_URL_DRIVERS = "http://localhost:5000/api"

document.addEventListener('DOMContentLoaded', function() {
  loadDrivers();
  loadDriverStats();
});

// Загрузка водителей
async function loadDrivers() {
  try {
    const response = await fetch(`${API_BASE_URL_DRIVERS}/Driver/getDriversList`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const drivers = await response.json();
    const tbody = document.querySelector('#driversTable tbody');
    
    if (!drivers || drivers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--color-primary); padding: 40px;">
            <div class="empty-state">
              <div class="empty-icon">📋</div>
              <h3>Водители не найдены</h3>
              <p>В системе пока нет зарегистрированных водителей</p>
            </div>
          </td>
        </tr>
      `;
      updateDriverCount(0);
      return;
    }

    tbody.innerHTML = drivers.map(driver => {
      const statusText = getStatusText(driver.driverStatus);
      const statusClass = getStatusClass(driver.driverStatus);
      const routeInfo = (driver.routeStart && driver.routeEnd) 
        ? `${driver.routeStart} → ${driver.routeEnd}` 
        : '—';

      return `
        <tr>
          <td data-label="ФИО">${driver.driverFullName}</td>
          <td data-label="Телефон">${driver.driverPhoneNumber}</td>
          <td data-label="Автомобиль">${driver.truckModel || '—'}</td>
          <td data-label="Госномер">${driver.truckRegisterNumber || '—'}</td>
          <td data-label="Статус"><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td data-label="Текущий маршрут">${routeInfo}</td>
        </tr>
      `;
    }).join('');

    updateDriverCount(drivers.length);
  } catch (error) {
    console.error('Ошибка загрузки водителей:', error);
    const tbody = document.querySelector('#driversTable tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--color-danger); padding: 40px;">
          <div class="empty-state">
            <div class="empty-icon">⚠</div>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить данные о водителях</p>
          </div>
        </td>
      </tr>
    `;
    updateDriverCount(0);
  }
}

function getStatusText(status) {
  const statusMap = {
    'Active': 'На линии',
    'Inactive': 'Свободен',
    'On_leave': 'В отпуске'
  };
  return statusMap[status] || status || 'Неизвестно';
}

// Helper function to get status CSS class
function getStatusClass(status) {
  const classMap = {
    'Active': 'on-line',
    'Inactive': 'off-line',
    'On_leave': 'on-vacation'
  };
  return classMap[status] || 'off-line';
}
// Загрузка статистики
async function loadDriverStats() {
  try {
    const response = await fetch(`${API_BASE_URL_DRIVERS}/Driver/getDriversList`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const drivers = await response.json();
    
    if (!drivers || drivers.length === 0) {
      document.getElementById('totalDrivers').textContent = '0';
      document.getElementById('driversOnLine').textContent = '0';
      document.getElementById('driversAvailable').textContent = '0';
      document.getElementById('driversInactive').textContent = '0';
      return;
    }

    const total = drivers.length;
    const onLine = drivers.filter(d => d.driverStatus === 'Active').length;
    const onLeave = drivers.filter(d => d.driverStatus === 'On_leave').length;
    const inactive = drivers.filter(d => d.driverStatus === 'Inactive').length;

    document.getElementById('totalDrivers').textContent = total;
    document.getElementById('driversOnLine').textContent = onLine;
    document.getElementById('driversAvailable').textContent = inactive;
    document.getElementById('driversInactive').textContent = onLeave;
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    document.getElementById('totalDrivers').textContent = '—';
    document.getElementById('driversOnLine').textContent = '—';
    document.getElementById('driversAvailable').textContent = '—';
    document.getElementById('driversInactive').textContent = '—';
  }
}

// Фильтрация
function filterDrivers() {
  // TODO: Реализовать фильтрацию на клиенте или запрос к API
}

// Clear search button
function clearSearch() {
  document.getElementById('searchDriver').value = '';
  document.getElementById('clearSearchBtn').classList.remove('visible');
  filterDrivers();
}

// Toggle clear button visibility
function toggleClearButton() {
  const searchInput = document.getElementById('searchDriver');
  const clearBtn = document.getElementById('clearSearchBtn');
  if (searchInput.value.length > 0) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }
}

// Update driver count
function updateDriverCount(count) {
  const countEl = document.getElementById('driverCount');
  if (countEl) {
    const word = getDriverWord(count);
    countEl.textContent = count + ' ' + word;
  }
}

function getDriverWord(count) {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return 'записей';
  if (lastOne === 1) return 'запись';
  if (lastOne >= 2 && lastOne <= 4) return 'записи';
  return 'записей';
}

// Показать toast уведомление
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Открытие модального окна
function openAddDriverModal() {
  document.getElementById('modalTitle').textContent = 'Добавить водителя';
  document.getElementById('driverForm').reset();
  document.getElementById('driverId').value = '';
  document.getElementById('driverModal').classList.add('active');
}

// Закрытие модального окна
function closeDriverModal() {
  const modal = document.getElementById('driverModal');
  modal.classList.add('closing');
  setTimeout(() => {
    modal.classList.remove('active', 'closing');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    // Reset display after animation
    setTimeout(() => {
      modal.style.display = '';
    }, 50);
  }, 300);
}

// Редактирование водителя
function editDriver(driverId) {
  // TODO: Загрузить данные водителя и открыть модалку
  alert('Редактирование водителя #' + driverId);
}

// Просмотр водителя
function viewDriver(driverId) {
  // TODO: Показать детальную информацию
  alert('Просмотр водителя #' + driverId);
}

// Сохранение водителя
async function saveDriver(event) {
  event.preventDefault();

  const driverData = {
    fullName: document.getElementById('driverName').value,
    phoneNumber: document.getElementById('driverPhone').value,
    email: document.getElementById('driverEmail').value,
    status: document.getElementById('driverStatus').value,
    truck: {
      modelName: document.getElementById('vehicleModel').value,
      registerNumber: document.getElementById('vehiclePlate').value
    }
  };

  if (!driverData.email) {
    delete driverData.email;
  }

  try {
    const response = await fetch(`${API_BASE_URL_DRIVERS}/Driver/addDriver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driverData)
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.message || 'Ошибка при добавлении водителя', 'error');
      return;
    }

    showToast('Водитель успешно добавлен', 'success');
    closeDriverModal();
    loadDrivers();
  } catch (error) {
    console.error('Ошибка:', error);
    showToast('Ошибка сети. Попробуйте позже', 'error');
  }
}

// Закрытие модалки по клику вне
document.getElementById('driverModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeDriverModal();
  }
});

// Закрытие модалки по Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('driverModal');
    if (modal.classList.contains('active')) {
      closeDriverModal();
    }
  }
});

// Переключение бокового меню на мобильных
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const menuToggle = document.querySelector('.menu-toggle');

  if (sidebar) {
    sidebar.classList.toggle('active');
  }

  if (menuToggle) {
    menuToggle.classList.toggle('active');
  }

  let overlay = document.getElementById('sidebarOverlay');
  if (overlay) {
    overlay.remove();
  } else {
    const newOverlay = document.createElement('div');
    newOverlay.id = 'sidebarOverlay';
    newOverlay.className = 'sidebar-overlay';
    newOverlay.onclick = toggleSidebar;
    document.body.appendChild(newOverlay);
  }
}

// Закрытие меню при клике на ссылку (для мобильных)
document.querySelectorAll('.sidebar-menu a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  });
});
