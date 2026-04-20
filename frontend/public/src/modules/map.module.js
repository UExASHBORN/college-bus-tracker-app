let map;
let marker;

window.initMap = function () {
  if (map) return; // 🛑 prevent duplicate init

  map = L.map('map').setView([26.8467, 80.9462], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  marker = L.marker([26.8467, 80.9462]).addTo(map);
};

window.updateMapLocation = function (lat, lng) {
  if (!map) return;

  const position = [lat, lng];

  marker.setLatLng(position);
  map.setView(position, map.getZoom() || 15);

  // Continuous tracking for mobile fallback
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if (window.updateMapLocation) {
      window.updateMapLocation(lat, lng);
    }

    await db.ref("bus/location").set({
      lat,
      lng,
      satellites: "phone",
      timestamp: Math.floor(Date.now() / 1000),
      source: "mobile"
    });

  });
}
};