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
    if (routePoints.length < 2) {
        console.warn('Недостаточно точек для построения маршрута');
        return;
    }
    console.log('Построение маршрута...', routePoints);
    if (adminMapInstance && routingControl) {
        adminMapInstance.removeControl(routingControl);
    }
    const waypoints = routePoints.map(p => L.latLng(p.lat, p.lng));

    routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        lineOptions: {
            styles: [{color: '#4589bd', opacity: 0.75, weight: 10}]
        },
        createMarker: function() {
            return null;
        },
    }).addTo(adminMapInstance);
    routingControl.on('routesfound', function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        const distanceEl = document.getElementById('routeDistance');
        const timeEl = document.getElementById('routeTime');
        distanceEl.textContent = (summary.totalDistance / 1000).toFixed(1) + ' км';
        timeEl.textContent = (summary.totalTime / 3600).toFixed(1) + ' ч';
    });
}