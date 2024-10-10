const defaultLocation = [62.23802, 25.74483];
const defaultZoomLevel = 13;
const markers = {
    "Agora" : {
        "pos": [62.23219, 25.73691],
        "info": "Lectures are here."
    },
    "MaA 103" : {
        "pos": [62.23100, 25.73350],
        "info": "Lectures are also here."
    },
    "Aalto-sali": {
        "pos": [62.24351, 25.74986],
        "info": "Preparty is here.",
        "icon": "/map/etkot.png"
    },
    "Club Escape": {
        "pos": [62.2437869, 25.7500804],
        "info": "Wednesday's afterparty.",
        "icon": "/map/jatkot.png"
    },
    "London": {
        "pos": [62.2446203, 25.7508283],
        "info": "Thursday's afterparty.",
        "icon": "/map/jatkot.png"
    },
    "Canteen Maija": {
        "pos": [62.23094, 25.73418],
        "icon": "/map/ruoka.png"
    },
    "Canteen Piato": {
        "pos": [62.2322793, 25.7374115],
        "icon": "/map/ruoka.png"
    },
    "Accommodation: Jyväskylä Christian School": {
        "pos": [62.240572, 25.727470],
        "icon": "/map/majoitus.png"
    },
    "Accommodation: Jyväskylä Normal School": {
        "pos": [62.239680, 25.736241],
        "icon": "/map/majoitus.png"
    }
}


const toggleFullscreen = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.querySelector("#kartta .window").requestFullscreen();
    }
};


window.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map", {
        zoomControl: false,
        zoomAnimation: false,
        minZoom: 11,
    })
        .setView(defaultLocation, defaultZoomLevel);
    let locationMarker, locationCircle, zoomed;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    L.Marker.prototype.options.icon = L.icon({iconUrl: "/map/default.png", iconSize: [30, 30]})

    for (const markerName of Object.keys(markers)) {
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

    document.querySelector("#kartta button.locate").addEventListener("click", () => {
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

    document.querySelector("#kartta button.zoom-in").addEventListener("click", () => {
        map.zoomIn(1);
    });

    document.querySelector("#kartta button.zoom-out").addEventListener("click", () => {
        map.zoomOut(1);
    });

    document.querySelectorAll("#kartta button.maximize")
        .forEach((e) => {
            e.addEventListener("click", () => {
                toggleFullscreen();
            });
        });
});