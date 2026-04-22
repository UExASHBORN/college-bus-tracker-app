# System Architecture

The College Bus Tracker consists of three main components:

1. **Hardware (ESP32 + NEO-6M GPS)**
   - The ESP32 reads GPS data from the NEO-6M module over serial.
   - It connects to Wi-Fi and pushes the latitude, longitude, and satellite count to Firebase Realtime Database every 5 seconds.

2. **Backend (Firebase)**
   - **Authentication:** Handles user login and role-based access control.
   - **Realtime Database:** Stores the live location of the bus and its active status.
   - **Hosting:** Serves the frontend web application.

3. **Frontend (Web Application)**
   - Built with plain HTML, CSS, and JavaScript.
   - Uses Google Maps API to render the map and bus marker.
   - Listens to Firebase Realtime Database for live coordinate updates.
   - Features an Admin Panel for authorized users to manually override location or toggle bus status.
