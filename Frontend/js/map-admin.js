"use strict";
let adminMapInstance = null;
let fullscreenMapInstance = null;
let routingControl = null;
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
 let routePoints = [];
        let routeMarkers = [];
        // Panel toggle for mobile
        function togglePanel() {
            const panel = document.getElementById('routeBuilderPanel');
            panel.classList.toggle('collapsed');
        }

        // Drag handle functionality for mobile
        (function initDragHandle() {
            const handle = document.getElementById('dragHandle');
            const panel = document.getElementById('routeBuilderPanel');
            let startY = 0;
            let startTransform = 0;
            let isDragging = false;

            function onTouchStart(e) {
                startY = e.touches[0].clientY;
                const transform = panel.style.transform;
                const match = transform.match(/translateY\((.+)px\)/);
                startTransform = match ? parseFloat(match[1]) : 0;
                isDragging = true;
                panel.style.transition = 'none';
            }

            function onTouchMove(e) {
                if (!isDragging) return;
                const deltaY = e.touches[0].clientY - startY;
                const newTransform = startTransform + deltaY;
                const panelHeight = panel.offsetHeight;
                const clampedTransform = Math.max(0, Math.min(newTransform, panelHeight - 60));
                panel.style.transform = `translateY(${clampedTransform}px)`;
            }

            function onTouchEnd() {
                if (!isDragging) return;
                isDragging = false;
                panel.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                const transform = panel.style.transform;
                const match = transform.match(/translateY\((.+)px\)/);
                const currentTransform = match ? parseFloat(match[1]) : 0;
                if (currentTransform > panel.offsetHeight / 3) {
                    panel.classList.add('collapsed');
                } else {
                    panel.classList.remove('collapsed');
                }
            }

            handle.addEventListener('touchstart', onTouchStart, { passive: true });
            handle.addEventListener('touchmove', onTouchMove, { passive: true });
            handle.addEventListener('touchend', onTouchEnd);
        })();

        function initRoutePage() {
            loadOrdersForSelect();
            loadDriversForSelect();
            initAdminMap();
            if (adminMapInstance) {
                adminMapInstance.on('click', function(e) {
                    addPointFromMap(e.latlng.lat, e.latlng.lng);
                });
            } else {
                console.error('Карта не инициализирована');
            }

            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('routeDate').value = today;
        }

        document.addEventListener('DOMContentLoaded', initRoutePage);

        function addRoutePoint() {
            if (window.innerWidth <= 768) {
                const panel = document.getElementById('routeBuilderPanel');
                panel.classList.remove('collapsed');
            }
        }

        function addPointFromMap(lat, lng) {
            const count = routePoints.length;
            const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
            const label = labels[count] || (count + 1);

            if (adminMapInstance) {
                const marker = L.marker([lat, lng], { draggable: 'true' }).addTo(adminMapInstance);

                marker.on('dragend', function(e) {
                    const newPos = e.target.getLatLng();
                    const pointIndex = routePoints.findIndex(p => p.marker === marker);
                    if (pointIndex !== -1) {
                        routePoints[pointIndex].lat = newPos.lat;
                        routePoints[pointIndex].lng = newPos.lng;
                        buildRoute();
                        updateRouteInfo();
                    }
                });

                routePoints.push({
                    id: Date.now(),
                    label: label,
                    lat: lat,
                    lng: lng,
                    address: 'Точка на карте',
                    marker: marker
                });

                routeMarkers.push(marker);

                console.log('routePoints after push:', routePoints);
                console.log('New point label:', routePoints[routePoints.length - 1].label);

                renderRoutePoints();
                buildRoute();
                updateRouteInfo();
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
                show: false,
                geocoder: L.Control.Geocoder ? L.Control.Geocoder.nominatim() : null,
                language: 'ru',
                lineOptions: {
                    styles: [{ color: '#6688bc', opacity: 0.8, weight: 10}]
                }
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

        function renderRoutePoints() {
            const container = document.getElementById('routePointsList');
            const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

            console.log('renderRoutePoints called, routePoints:', routePoints);
            console.log('container exists:', !!container);

            if (routePoints.length === 0) {
                container.className = 'route-points-list empty-state';
                container.innerHTML = `
                    <div class="empty-icon">&#128506;</div>
                    <div class="empty-text">Точки маршрута не добавлены.<br>Кликните по карте или нажмите «Добавить точку»</div>
                `;
                document.getElementById('routePointsCount').textContent = '0';
                return;
            }

            container.className = 'route-points-list';
            container.innerHTML = routePoints.map((point, index) => {
                const pointLabel = point.label || labels[index] || (index + 1);
                console.log(`Point ${index}: label=${pointLabel}, point.label=${point.label}`);
                return `
                <div class="route-point">
                    <div class="route-point-marker">${pointLabel}</div>
                    <div class="route-point-info">
                        <div class="route-point-address">${point.address || 'Точка на карте'}</div>
                    </div>
                    <button class="route-point-remove" onclick="removeRoutePoint(${point.id})" aria-label="Удалить точку">&times;</button>
                </div>
            `}).join('');

            document.getElementById('routePointsCount').textContent = routePoints.length;
            console.log('renderRoutePoints completed, HTML:', container.innerHTML);
        }

        function removeRoutePoint(pointId) {
            const pointIndex = routePoints.findIndex(p => p.id === pointId);
            if (pointIndex !== -1) {
                const point = routePoints[pointIndex];
                if (point.marker && adminMapInstance) {
                    adminMapInstance.removeLayer(point.marker);
                }
                routeMarkers = routeMarkers.filter(m => m !== point.marker);
                routePoints.splice(pointIndex, 1);
                renderRoutePoints();
                updateRouteInfo();
                if (routePoints.length >= 2) {
                    buildRoute();
                } else if (routingControl && adminMapInstance) {
                    adminMapInstance.removeControl(routingControl);
                    routingControl = null;
                }
            }
        }

        function clearRoutePoints() {
            routeMarkers.forEach(marker => {
                if (marker && adminMapInstance) {
                    adminMapInstance.removeLayer(marker);
                }
            });
            routeMarkers = [];
            routePoints = [];
            if (routingControl && adminMapInstance) {
                adminMapInstance.removeControl(routingControl);
                routingControl = null;
            }
            renderRoutePoints();
            document.getElementById('routeDistance').textContent = '— км';
            document.getElementById('routeTime').textContent = '— ч';
        }

        function updateRouteInfo() {
            const distanceEl = document.getElementById('routeDistance');
            const timeEl = document.getElementById('routeTime');

            if (routePoints.length < 2) {
                distanceEl.textContent = '— км';
                timeEl.textContent = '— ч';
                return;
            }

            let totalDistance = 0;
            for (let i = 1; i < routePoints.length; i++) {
                const prev = routePoints[i - 1];
                const curr = routePoints[i];
                totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
            }

            const distanceKm = totalDistance.toFixed(1);
            const timeHours = (totalDistance / 80).toFixed(1);

            // Animate values
            animateValue(distanceEl, distanceKm + ' км');
            animateValue(timeEl, timeHours + ' ч');
        }

        function animateValue(element, newValue) {
            element.classList.add('animate');
            element.textContent = newValue;
            setTimeout(() => element.classList.remove('animate'), 500);
        }

        function calculateDistance(lat1, lng1, lat2, lng2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }

        // Загрузка заказов
        async function loadOrdersForSelect() {
            try {
                // TODO: const response = await fetch('/api/orders/active');
                const select = document.getElementById('orderSelect');
                // orders.forEach(...)
            } catch (error) {
                console.error('Ошибка:', error);
            }
        }

        // Загрузка водителей
        async function loadDriversForSelect() {
            try {
                // TODO: const response = await fetch('/api/drivers/available');
                const select = document.getElementById('driverSelect');
                // drivers.forEach(...)
            } catch (error) {
                console.error('Ошибка:', error);
            }
        }

        // Сохранение маршрута
        function saveRoute() {
            if (routePoints.length < 2) {
                alert('Добавьте минимум 2 точки маршрута');
                return;
            }

            const btn = document.getElementById('saveRouteBtn');
            btn.classList.add('loading');
            btn.innerHTML = '<span class="loading-spinner"></span> Сохранение...';

            const routeData = {
                points: routePoints.map(p => ({
                    lat: p.lat,
                    lng: p.lng,
                    label: p.label
                })),
                orderId: document.getElementById('orderSelect').value,
                driverId: document.getElementById('driverSelect').value,
                date: document.getElementById('routeDate').value,
                distance: document.getElementById('routeDistance').textContent,
                time: document.getElementById('routeTime').textContent
            };

            console.log('Сохранение маршрута:', routeData);

            // TODO: Отправка на сервер
            // await fetch('/api/routes', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(routeData)
            // });

            // Simulate save delay and show success
            setTimeout(() => {
                btn.classList.remove('loading');
                btn.classList.add('success');
                btn.innerHTML = '&#10003; Сохранено!';

                // Show success overlay
                const overlay = document.getElementById('successOverlay');
                overlay.classList.add('visible');

                setTimeout(() => {
                    overlay.classList.remove('visible');
                    btn.classList.remove('success');
                    btn.innerHTML = 'Сохранить маршрут';
                    clearRoutePoints();
                }, 2000);
            }, 800);
        }

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