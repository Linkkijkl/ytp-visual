const defaultLocation = [62.23802, 25.74483];
const defaultZoomLevel = 13;
const markers = {
    "Agora" : {
        "icon": "info.png", //TODO: Change to something more elegant
        "pos": [62.23219, 25.73691],
        "info": "Luennot luennoidaan täällä."
    },
    "Aalto-sali": {
        "pos": [62.24351, 25.74986],
        "info": "Etkot etkoillaan täällä."
    },
    "Club Escape": {
        "pos": [62.2437869, 25.7500804],
        "info": "Ensimmäisen päivän jatkopaikka."
    },
    "London": {
        "pos": [62.2446203, 25.7508283],
        "info": "Toisen päivän jatkopaikka."
    },
    "Ravintola Maija": {
        "pos": [62.23094, 25.73418]
    },
    "Ravintola Piato": {
        "pos": [62.2322793, 25.7374115]
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map", { zoomControl: false, zoomAnimation: false, minZoom: 11 })
        .setView(defaultLocation, defaultZoomLevel);
    let locationMarker, locationCircle, zoomed;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    for (markerName of Object.keys(markers)) {
        const marker = markers[markerName];
        const gmapsLink = `https://www.google.com/maps/place/${marker.pos.join(",")}`
        const info = `
            <span style="font-weight: bold">${markerName}</span>
            <br/>
            ${marker.info ? marker.info + "<br/>" : ""}
            <a href="${gmapsLink}" target="_blank" rel="noopener noreferrer">Google Maps</a>`;
        let markerOptions = {"title": markerName};
        if (marker.icon) {
            markerOptions["icon"] = L.icon({iconUrl: marker.icon, iconSize: [30, 30]});
        }
        L.marker(marker.pos, markerOptions).bindPopup(info).addTo(map);
    }

    document.querySelector("#map button.locate").addEventListener("click", () => {
        navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;
        
            if (locationMarker) {
                map.removeLayer(locationMarker);
                map.removeLayer(locationCircle);
            }

            locationMarker = L.marker([lat, lng]).addTo(map);
            locationCircle = L.circle([lat, lng], { radius: accuracy, opacity: 0.1 }).addTo(map);

            if (!zoomed) {
                zoomed = map.fitBounds(locationCircle.getBounds()); 
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