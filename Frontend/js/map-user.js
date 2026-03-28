/**
 * Карта для пользователя (клиента)
 * 
 * Здесь будет отображаться местоположение груза клиента.
 * Подключите ваш API карты (Leaflet, Google Maps, Яндекс.Карты и т.д.)
 * 
 * РЕКОМЕНДАЦИЯ: Используйте Leaflet.js + OpenStreetMap (бесплатно)
 * Подключение:
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
*/

// Глобальная переменная для хранения экземпляра карты
let userMapInstance = null;
let fullscreenMapInstance = null;

// ============================================
// Инициализация карты
// ============================================
function initUserMap() {
    console.log('Инициализация карты пользователя...');
    
    // TODO: Подключите здесь ваш API карты
    // Пример для Leaflet:
    /*
    if (document.getElementById('userMap')) {
        userMapInstance = L.map('userMap').setView([55.7558, 37.6173], 10); // Москва
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(userMapInstance);
        
        // Добавляем маркер груза
        const cargoMarker = L.marker([55.7558, 37.6173]).addTo(userMapInstance);
        cargoMarker.bindPopup('<b>Ваш груз</b><br>В пути').openPopup();
    }
    */
    
    // Заглушка - удаляйте при подключении реального API
    const mapPlaceholder = document.getElementById('userMap');
    if (mapPlaceholder) {
        mapPlaceholder.innerHTML = `
            <i class="icon-map"></i>
            <p>Здесь будет карта с местоположением груза</p>
            <small>Подключите API карты в файле js/map-user.js</small>
            <p style="margin-top: 15px; font-size: 12px;">
                Рекомендуемый API: <strong>Leaflet.js + OpenStreetMap</strong> (бесплатно)<br>
                Альтернативы: Google Maps API, Яндекс.Карты API, 2GIS
            </p>
        `;
    }
}

// ============================================
// Обновление позиции груза (вызывайте при получении данных от бекенда)
// ============================================
function updateCargoPosition(latitude, longitude, status = 'В пути') {
    console.log('Обновление позиции груза:', latitude, longitude, status);
    
    // TODO: Подключите здесь обновление позиции на карте
    /*
    if (userMapInstance) {
        // Перемещаем маркер
        userMapInstance.setView([latitude, longitude], 12);
        
        // Обновляем или создаём маркер
        if (window.cargoMarker) {
            window.cargoMarker.setLatLng([latitude, longitude]);
            window.cargoMarker.bindPopup(`<b>Ваш груз</b><br>${status}`).openPopup();
        } else {
            window.cargoMarker = L.marker([latitude, longitude]).addTo(userMapInstance);
            window.cargoMarker.bindPopup(`<b>Ваш груз</b><br>${status}`).openPopup();
        }
    }
    */
}

// ============================================
// Загрузка данных о грузе с бекенда
// ============================================
async function loadCargoData() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user) {
        console.error('Пользователь не авторизован');
        return;
    }
    
    try {
        // TODO: Замените на реальный API вызов к вашему ASP.NET бекенду
        // Пример:
        // const response = await fetch(`/api/cargo/${user.id}`);
        // const data = await response.json();
        // updateCargoPosition(data.latitude, data.longitude, data.status);
        
        // Имитация данных для демонстрации
        const mockData = {
            orderId: '#LOG-2024-001',
            latitude: 55.7558, // Москва
            longitude: 37.6173,
            status: 'В пути',
            estimatedDelivery: '28.03.2024'
        };
        
        console.log('Данные о грузе:', mockData);
        updateCargoPosition(mockData.latitude, mockData.longitude, mockData.status);
        
    } catch (error) {
        console.error('Ошибка загрузки данных о грузе:', error);
    }
}

// ============================================
// Обновление карты
// ============================================
function refreshMap() {
    console.log('Обновление карты...');
    loadCargoData();
    
    // Визуальный эффект обновления
    const mapContainer = document.getElementById('userMap');
    if (mapContainer) {
        mapContainer.style.opacity = '0.5';
        setTimeout(() => {
            mapContainer.style.opacity = '1';
        }, 300);
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
        fullscreenMapInstance = L.map('fullscreenMapContainer').setView([55.7558, 37.6173], 10);
        
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
    initUserMap();
    initFullscreenMap();
    loadCargoData();
    
    // Автообновление позиции каждые 30 секунд
    setInterval(loadCargoData, 30000);
});
