"use strict";
let adminMapInstance = null;
let fullscreenMapInstance = null;
let routingControl = null;
let selectedPoints = [];
function initAdminMap() {
    console.log('Инициализация карты администратора...');
    const mapElement = document.getElementById('adminMap');
    if (mapElement) {
        adminMapInstance = L.map('adminMap').setView([53.9, 27.56], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(adminMapInstance);
        console.log('Карта успешно инициализирована');
    }
}
function buildRoute() {
    if (selectedPoints.length < 2) {
        console.warn('Недостаточно точек для построения маршрута');
        return;
    }
    console.log('Построение маршрута...', selectedPoints);
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
    routingControl.on('routesfound', function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        const distanceInput = document.getElementById('routeDistance');
        const timeInput = document.getElementById('routeTime');
        distanceInput.value = (summary.totalDistance / 1000).toFixed(1);
        timeInput.value = (summary.totalTime / 3600).toFixed(1);
    });
}
//# sourceMappingURL=map-admin.js.map