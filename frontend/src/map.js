let map, marker, infoWindow, firstFix = true;
let stopMarkers = [];

window.ROUTE_STOPS = [
  { id: 1, name: "Tedhipulia", lat: 26.8970, lng: 80.9570, time: "07:00 AM" },
  { id: 2, name: "Kapoorthala", lat: 26.8830, lng: 80.9420, time: "07:15 AM" },
  { id: 3, name: "IT Chowk", lat: 26.8650, lng: 80.9400, time: "07:25 AM" },
  { id: 4, name: "Hazratganj", lat: 26.8500, lng: 80.9400, time: "07:35 AM" },
  { id: 5, name: "Badshahnagar", lat: 26.8670, lng: 80.9630, time: "07:45 AM" },
  { id: 6, name: "Nishatganj", lat: 26.8620, lng: 80.9560, time: "07:55 AM" },
  { id: 7, name: "Khurram Nagar", lat: 26.8850, lng: 80.9680, time: "08:05 AM" },
  { id: 8, name: "Tedhipulia", lat: 26.8970, lng: 80.9570, time: "08:15 AM" },
  { id: 9, name: "Gudamba", lat: 26.9150, lng: 80.9550, time: "08:25 AM" },
  { id: 10, name: "Sports College", lat: 26.9250, lng: 80.9550, time: "08:35 AM" },
  { id: 11, name: "Integral University", lat: 26.9360, lng: 80.9500, time: "08:45 AM" }
];

window.MOCK_STUDENTS = [
  { id: "S001", name: "Mohammad Zaid", stopId: 1 },
  { id: "S002", name: "Mohd Aarfeen", stopId: 1 },
  { id: "S003", name: "Adeel Arif", stopId: 2 },
  { id: "S004", name: "Hanzala", stopId: 3 },
  { id: "S005", name: "Abdullah", stopId: 4 },
  { id: "S006", name: "Hasan", stopId: 5 },
  { id: "S007", name: "Humza", stopId: 6 },
  { id: "S008", name: "Ayan", stopId: 7 },
  { id: "S009", name: "Tabish", stopId: 8 },
  { id: "S010", name: "kaif", stopId: 9 },
  { id: "S011", name: "Ali", stopId: 10 }
];
// ── Init Google Map (called by Maps script) ──
function initMap() {
  const defaultPos = { lat: 26.8467, lng: 80.9462 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: defaultPos,
    mapTypeId: "roadmap",
    styles: [
      { elementType: "geometry",            stylers: [{ color: "#1d2c4d" }] },
      { elementType: "labels.text.fill",    stylers: [{ color: "#8ec3b9" }] },
      { elementType: "labels.text.stroke",  stylers: [{ color: "#1a3646" }] },
      { featureType: "road", elementType: "geometry",           stylers: [{ color: "#304a7d" }] },
      { featureType: "road", elementType: "labels.text.fill",   stylers: [{ color: "#98a5be" }] },
      { featureType: "water", elementType: "geometry",          stylers: [{ color: "#0e1626" }] },
      { featureType: "poi",                 stylers: [{ visibility: "off" }] }
    ]
  });

  // Stop Markers removed at user request to keep map clean.
  
  // Bus Marker
  marker = new google.maps.Marker({
    position: defaultPos,
    map: map,
    title: "College Bus",
    zIndex: 999,
    icon: {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#3b82f6" stroke="white" stroke-width="3"/>
          <text x="24" y="31" font-size="22" text-anchor="middle">🚌</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(48, 48),
      anchor: new google.maps.Point(24, 24)
    }
  });

  infoWindow = new google.maps.InfoWindow({
    content: "<div style='color:#000;font-weight:600'>College Bus</div><div style='color:#555;font-size:12px'>Live tracking active</div>"
  });
  marker.addListener("click", () => infoWindow.open(map, marker));

  // Trigger firebase listener when map is ready
  if (typeof listenToFirebase === "function") {
    listenToFirebase();
  }
}

window.initMap = initMap;
