const defaultLocation = [62.23802, 25.74483];
const defaultZoomLevel = 13;

window.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map", { zoomControl: false, zoomAnimation: false })
            .setView(defaultLocation, defaultZoomLevel);
    let marker, circle, zoomed;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    document.querySelector("#map button.locate").addEventListener("click", () => {
        navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;
        
            if (marker) {
                map.removeLayer(marker);
                map.removeLayer(circle);
            }

            marker = L.marker([lat, lng]).addTo(map);
            circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);

            if (!zoomed) {
                zoomed = map.fitBounds(circle.getBounds()); 
            }

            map.setView([lat, lng]);
        }, null);
    });

    document.querySelector("#map button.zoom-in").addEventListener("click", () => {
        map.zoomIn(1);
    });

    document.querySelector("#map button.zoom-out").addEventListener("click", () => {
        map.zoomOut(1);
    });
});