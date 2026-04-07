interface RoutePoint {
    latitude: number;
    longitude: number;
}

let adminMapInstance: L.Map | null = null;
let fullscreenMapInstance: L.Map | null = null;
let routingControl: any = null;
let selectedPoints: RoutePoint[] = [];

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

    routingControl = (L as any).Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        show: false,
        geocoder: (L.Control as any).Geocoder ? (L.Control as any).Geocoder.nominatim() : null,
        language: 'ru'
    }).addTo(adminMapInstance!);

    routingControl.on('routesfound', function(e: any) {
        const routes = e.routes;
        const summary = routes[0].summary;

        const distanceInput = document.getElementById('routeDistance') as HTMLInputElement;
        const timeInput = document.getElementById('routeTime') as HTMLInputElement;
        
        distanceInput.value = (summary.totalDistance / 1000).toFixed(1);
        timeInput.value = (summary.totalTime / 3600).toFixed(1);
    });
}
