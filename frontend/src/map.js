let map;
let marker;

window.initMap = function () {
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
  map.setView(position, 15);
};