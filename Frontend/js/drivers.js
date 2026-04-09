const API_BASE_URL_DRIVERS = "http://localhost:5000/api"

document.addEventListener('DOMContentLoaded', function() {
  loadDrivers();
  loadDriverStats();
});

// Загрузка водителей
async function loadDrivers() {
  try {
    // TODO: const response = await fetch('/api/drivers');
    // const drivers = await response.json();

    const tbody = document.querySelector('#driversTable tbody');

    // Show loading skeleton
    tbody.innerHTML = `
                    <tr class="skeleton-row skeleton"></tr>
                    <tr class="skeleton-row skeleton"></tr>
                    <tr class="skeleton-row skeleton"></tr>
                `;

    // Simulate loading delay (remove in production)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Заглушка
    tbody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            <div class="empty-state">
                                <div class="empty-icon">&#128663;</div>
                                <h3>Нет данных о водителях</h3>
                                <p>Добавьте первого водителя, чтобы начать работу</p>
                                <button class="btn-add-driver" onclick="openAddDriverModal()" style="display: inline-flex; margin-top: 10px;">
                                    <span class="icon-plus">+</span> Добавить водителя
                                </button>
                            </div>
                        </td>
                    </tr>
                `;

    updateDriverCount(0);
  } catch (error) {
    console.error('Ошибка загрузки водителей:', error);
    const tbody = document.querySelector('#driversTable tbody');
    tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--color-danger); padding: 40px;">
                            <div class="empty-state">
                                <div class="empty-icon">&#9888;</div>
                                <h3>Ошибка загрузки</h3>
                                <p>Не удалось загрузить данные о водителях</p>
                            </div>
                        </td>
                    </tr>
                `;
  }
}

// Загрузка статистики
async function loadDriverStats() {
  try {
    // TODO: const response = await fetch('/api/drivers/stats');

    document.getElementById('totalDrivers').textContent = '—';
    document.getElementById('driversOnLine').textContent = '—';
    document.getElementById('driversAvailable').textContent = '—';
    document.getElementById('driversInactive').textContent = '—';
  } catch (error) {
    console.error('Ошибка:', error);
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
