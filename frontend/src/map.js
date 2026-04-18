let map, marker, infoWindow, firstFix = true;

// ── Init Google Map (called by Maps script) ──
function initMap() {
  const defaultPos = { lat: 26.8467, lng: 80.9462 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
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

  marker = new google.maps.Marker({
    position: defaultPos,
    map: map,
    title: "College Bus",
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
