window.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([51.505, -0.09], 13);
    let marker, circle, zoomed;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

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