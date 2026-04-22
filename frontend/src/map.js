let map, marker, firstFix = true;

window.ROUTE_STOPS = [
  { id: 1,  name: "Tedhipulia",        lat: 26.8970, lng: 80.9570, time: "07:00 AM" },
  { id: 2,  name: "Kapoorthala",       lat: 26.8830, lng: 80.9420, time: "07:15 AM" },
  { id: 3,  name: "IT Chowk",          lat: 26.8650, lng: 80.9400, time: "07:25 AM" },
  { id: 4,  name: "Hazratganj",        lat: 26.8500, lng: 80.9400, time: "07:35 AM" },
  { id: 5,  name: "Badshahnagar",      lat: 26.8670, lng: 80.9630, time: "07:45 AM" },
  { id: 6,  name: "Nishatganj",        lat: 26.8620, lng: 80.9560, time: "07:55 AM" },
  { id: 7,  name: "Khurram Nagar",     lat: 26.8850, lng: 80.9680, time: "08:05 AM" },
  { id: 8,  name: "Tedhipulia",        lat: 26.8970, lng: 80.9570, time: "08:15 AM" },
  { id: 9,  name: "Gudamba",           lat: 26.9150, lng: 80.9550, time: "08:25 AM" },
  { id: 10, name: "Sports College",    lat: 26.9250, lng: 80.9550, time: "08:35 AM" },
  { id: 11, name: "Integral University",lat: 26.9360, lng: 80.9500, time: "08:45 AM" }
];

window.MOCK_STUDENTS = [
  { id: "S001", name: "Mohammad Zaid", stopId: 1 },
  { id: "S002", name: "Mohd Aarfeen",  stopId: 1 },
  { id: "S003", name: "Adeel Arif",    stopId: 2 },
  { id: "S004", name: "Hanzala",       stopId: 3 },
  { id: "S005", name: "Abdullah",      stopId: 4 },
  { id: "S006", name: "Hasan",         stopId: 5 },
  { id: "S007", name: "Humza",         stopId: 6 },
  { id: "S008", name: "Ayan",          stopId: 7 },
  { id: "S009", name: "Tabish",        stopId: 8 },
  { id: "S010", name: "Kaif",          stopId: 9 },
  { id: "S011", name: "Ali",           stopId: 10 }
];

// ── Init Leaflet Map ──
function initMap() {
  const defaultPos = [26.8467, 80.9462];

  // Create map with dark CartoDB tiles
  map = L.map("map", {
    center: defaultPos,
    zoom: 12,
    zoomControl: true,
    attributionControl: true
  });

  // Dark tile layer — CartoDB Dark Matter (free, no key required)
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20
  }).addTo(map);

  // Custom bus icon using a div with emoji
  const busIcon = L.divIcon({
    html: `
      <div style="
        width: 48px; height: 48px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        border-radius: 50%;
        border: 3px solid white;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
        box-shadow: 0 3px 12px rgba(59,130,246,0.6);
      ">🚌</div>
    `,
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28]
  });

  // Bus marker
  marker = L.marker(defaultPos, { icon: busIcon }).addTo(map);
  marker.bindPopup(`
    <div style="font-family: Inter, sans-serif; padding: 4px;">
      <div style="font-weight: 700; font-size: 14px; color: #1e293b;">🚌 College Bus</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Live tracking active</div>
    </div>
  `);

  // Expose globally so app.js can update position
  window.map      = map;
  window.marker   = marker;
  window.firstFix = firstFix;

  // Trigger Firebase listener now that map is ready
  if (typeof listenToFirebase === "function") {
    listenToFirebase();
  }
}

window.initMap = initMap;
