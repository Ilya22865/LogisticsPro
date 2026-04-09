"use strict";
let userMapInstance = null;
let fullscreenUserMapInstance = null;
function initUserMap() {
    console.log('Инициализация карты пользователя...');
    const mapElement = document.getElementById('userMap');
    if (mapElement) {
        userMapInstance = L.map('userMap').setView([53.9, 27.56], 7);
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
// Обновление карты
// ============================================
// function refreshMap() {
//     console.log('Обновление карты...');
//     loadCargoData();
//     // Визуальный эффект обновления
//     const mapContainer = document.getElementById('userMap');
//     if (mapContainer) {
//         mapContainer.style.opacity = '0.5';
//         setTimeout(() => {
//             mapContainer.style.opacity = '1';
//         }, 300);
//     }
// }
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
function initUserDashboard() {
    initUserMap();
    if(!userMapInstance) {
        console.log('Ошибка загрузки карты');
    }
}

document.addEventListener('DOMContentLoaded', initUserDashboard);