/**
 * Карта для администратора (построение маршрутов)
 * 
 * Здесь администратор сможет строить маршруты для водителей,
 * добавлять точки, рассчитывать расстояние и время в пути.
 * 
 * РЕКОМЕНДАЦИЯ: Используйте Leaflet.js + OpenStreetMap (бесплатно)
 * Для построения маршрутов: Leaflet Routing Machine (плагин)
 * 
 * Подключение:
 *   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
 *   <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
 *   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
 *   <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
 */

// Глобальная переменная для хранения экземпляра карты
let adminMapInstance = null;
let fullscreenMapInstance = null;
let routingControl = null;
let selectedPoints = [];

// ============================================
// Инициализация карты
// ============================================
function initAdminMap() {
    console.log('Инициализация карты администратора...');
    
    // TODO: Подключите здесь ваш API карты
    // Пример для Leaflet с Routing Machine:
    /*
    if (document.getElementById('adminMap')) {
        adminMapInstance = L.map('adminMap').setView([55.7558, 37.6173], 7); // Россия
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(adminMapInstance);
        
        // Обработка клика по карте для добавления точек маршрута
        adminMapInstance.on('click', function(e) {
            addRoutePoint(e.latlng.lat, e.latlng.lng);
        });
    }
    */
    
    // Заглушка - удаляйте при подключении реального API
    const mapPlaceholder = document.getElementById('adminMap');
    if (mapPlaceholder) {
        mapPlaceholder.innerHTML = `
            <i class="icon-map"></i>
            <p>Здесь будет карта для построения маршрутов</p>
            <small>Подключите API карты в файле js/map-admin.js</small>
            <p style="margin-top: 15px; font-size: 12px;">
                <strong>Рекомендуемая связка:</strong><br>
                Leaflet.js + OpenStreetMap + Leaflet Routing Machine<br><br>
                <strong>Альтернативы:</strong><br>
                Google Maps API, Яндекс.Карты API, 2GIS API
            </p>
            <p style="margin-top: 10px; font-size: 11px; color: #638ECB;">
                Подсказка: Кликните "Новый маршрут" и выбирайте точки на карте
            </p>
        `;
    }
}

// ============================================
// Добавление точки маршрута
// ============================================
function addRoutePoint(latitude, longitude, label = null) {
    console.log('Добавление точки маршрута:', latitude, longitude);
    
    selectedPoints.push({ latitude, longitude, label });
    
    // TODO: Отрисовка точки на карте
    /*
    if (adminMapInstance) {
        const marker = L.marker([latitude, longitude]).addTo(adminMapInstance);
        
        if (label) {
            marker.bindPopup(label).openPopup();
        }
        
        // Если уже есть 2 точки, строим маршрут
        if (selectedPoints.length >= 2) {
            buildRoute();
        }
    }
    */
    
    updateRouteForm();
}

// ============================================
// Построение маршрута между точками
// ============================================
function buildRoute() {
    if (selectedPoints.length < 2) {
        console.warn('Недостаточно точек для построения маршрута');
        return;
    }
    
    console.log('Построение маршрута...', selectedPoints);
    
    // TODO: Построение маршрута с помощью API
    /*
    if (adminMapInstance && routingControl) {
        adminMapInstance.removeControl(routingControl);
    }
    
    const waypoints = selectedPoints.map(p => L.latLng(p.latitude, p.longitude));
    
    routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder ? L.Control.Geocoder.nominatim() : null,
        language: 'ru'
    }).addTo(adminMapInstance);
    
    // Получаем информацию о маршруте
    routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        
        // Заполняем форму данными
        document.getElementById('routeDistance').value = (summary.totalDistance / 1000).toFixed(1);
        document.getElementById('routeTime').value = (summary.totalTime / 3600).toFixed(1);
    });
    */
    
    // Имитация для демонстрации
    simulateRouteBuilding();
}

// ============================================
// Имитация построения маршрута (удалите при подключении API)
// ============================================
function simulateRouteBuilding() {
    if (selectedPoints.length >= 2) {
        // Имитация расчёта расстояния и времени
        const distance = Math.round(Math.random() * 500 + 100); // 100-600 км
        const time = (distance / 80).toFixed(1); // Средняя скорость 80 км/ч
        
        document.getElementById('routeDistance').value = distance;
        document.getElementById('routeTime').value = time;
        
        alert(`Маршрут построен!\nРасстояние: ${distance} км\nВремя в пути: ~${time} ч`);
    }
}

// ============================================
// Обновление формы маршрута
// ============================================
function updateRouteForm() {
    const startInput = document.getElementById('routeStart');
    const endInput = document.getElementById('routeEnd');
    
    if (selectedPoints.length > 0 && startInput) {
        startInput.value = `Точка ${selectedPoints[0].latitude.toFixed(4)}, ${selectedPoints[0].longitude.toFixed(4)}`;
    }
    
    if (selectedPoints.length > 1 && endInput) {
        endInput.value = `Точка ${selectedPoints[selectedPoints.length - 1].latitude.toFixed(4)}, ${selectedPoints[selectedPoints.length - 1].longitude.toFixed(4)}`;
    }
}

// ============================================
// Начало нового маршрута
// ============================================
function startNewRoute() {
    console.log('Начало построения нового маршрута');
    
    selectedPoints = [];
    
    if (routingControl && adminMapInstance) {
        adminMapInstance.removeControl(routingControl);
        routingControl = null;
    }
    
    // Очищаем форму
    const form = document.getElementById('routeForm');
    if (form) {
        form.reset();
    }
    
    alert('Режим построения маршрута активирован.\n\nКликайте по карте, чтобы добавить точки:\n1. Первая клик - точка отправления\n2. Второй клик - точка назначения\n\nПосле выбора 2 точек маршрут будет построен автоматически.');
    
    // TODO: Включить режим добавления точек
    /*
    if (adminMapInstance) {
        adminMapInstance.on('click', function(e) {
            addRoutePoint(e.latlng.lat, e.latlng.lng);
        });
    }
    */
}

// ============================================
// Очистка маршрута
// ============================================
function clearRoute() {
    console.log('Очистка маршрута');
    
    selectedPoints = [];
    
    if (routingControl && adminMapInstance) {
        adminMapInstance.removeControl(routingControl);
        routingControl = null;
    }
    
    // TODO: Очистить маркеры на карте
    /*
    if (adminMapInstance) {
        adminMapInstance.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                adminMapInstance.removeLayer(layer);
            }
        });
    }
    */
    
    // Очищаем форму
    const form = document.getElementById('routeForm');
    if (form) {
        form.reset();
    }
    
    alert('Маршрут очищен');
}

// ============================================
// Сохранение маршрута
// ============================================
function saveRoute(event) {
    event.preventDefault();
    
    const routeData = {
        orderId: document.getElementById('orderSelect').value,
        driverId: document.getElementById('driverSelect').value,
        start: document.getElementById('routeStart').value,
        end: document.getElementById('routeEnd').value,
        distance: document.getElementById('routeDistance').value,
        time: document.getElementById('routeTime').value,
        date: document.getElementById('routeDate').value,
        notes: document.getElementById('routeNotes').value,
        points: selectedPoints
    };
    
    console.log('Сохранение маршрута:', routeData);
    
    // TODO: Отправка данных на бекенд
    /*
    fetch('/api/routes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Маршрут успешно сохранён!');
        clearRoute();
    })
    .catch(error => {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка при сохранении маршрута');
    });
    */
    
    // Имитация сохранения
    alert('Маршрут сохранён (демо-режим)\n\nДанные маршрута:\n' + 
          JSON.stringify(routeData, null, 2));
    
    clearRoute();
}

// ============================================
// Загрузка активных маршрутов
// ============================================
async function loadActiveRoutes() {
    try {
        // TODO: Замените на реальный API вызов
        // const response = await fetch('/api/routes/active');
        // const routes = await response.json();
        
        // Имитация данных
        const mockRoutes = [
            { id: 1, order: '#LOG-2024-001', start: 'Москва', end: 'Санкт-Петербург', driver: 'Иванов И.И.', status: 'В пути' },
            { id: 2, order: '#LOG-2024-002', start: 'Казань', end: 'Екатеринбург', driver: 'Петров П.П.', status: 'Ожидание' }
        ];
        
        console.log('Активные маршруты:', mockRoutes);
        
    } catch (error) {
        console.error('Ошибка загрузки маршрутов:', error);
    }
}

// ============================================
// Полноэкранный режим
// ============================================
function initFullscreenMap() {
    // TODO: Инициализация полноэкранной карты
    /*
    const fullscreenContainer = document.getElementById('fullscreenMapContainer');
    if (fullscreenContainer && !fullscreenMapInstance) {
        fullscreenMapInstance = L.map('fullscreenMapContainer').setView([55.7558, 37.6173], 7);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(fullscreenMapInstance);
    }
    */
}

// ============================================
// Инициализация при загрузке страницы
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initAdminMap();
    initFullscreenMap();
    loadActiveRoutes();
});
