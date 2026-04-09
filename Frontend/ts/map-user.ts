let userMapInstance: L.Map | null = null;
let fullscreenUserMapInstance: L.Map | null = null;

function initUserMap() {
    console.log('Инициализация карты пользователя...');
    
    const mapElement = document.getElementById('userMap');

    if(mapElement) {
        userMapInstance = L.map('userMap').setView([53.9,27.56], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(userMapInstance);

        console.log('Карта успешно инициализирована.');
    }
}
document.addEventListener('DOMContentLoaded', function() {
    initUserMap();
});
