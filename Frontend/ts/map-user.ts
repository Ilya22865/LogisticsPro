let userMapInstance: L.Map | null = null;
let fullscreenUserMapInstance: L.Map | null = null;

function initUserMap() {
    console.log('Инициализация карты пользователя...');
    
    const mapElement = document.getElementById('cargoMap');

    if(mapElement) {
        userMapInstance = L.map('cargoMap').setView([53.9,27.56], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(userMapInstance);

        console.log('Карта успешно инициализирована.');
    }
}

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
