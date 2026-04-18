# Setup Guide

## Hardware Setup
1. **Components Needed:** ESP32 board, NEO-6M GPS module, jumper wires.
2. **Wiring:**
   - NEO-6M VCC -> ESP32 3.3V
   - NEO-6M GND -> ESP32 GND
   - NEO-6M TX -> ESP32 RX (GPIO 16)
   - NEO-6M RX -> ESP32 TX (GPIO 17)

## Firmware Setup (Arduino IDE)
1. Install the ESP32 board support in Arduino IDE.
2. Install the following libraries:
   - `TinyGPSPlus` by Mikal Hart
   - `Firebase ESP Client` by Mobizt
3. Open `firmware/esp32_gps_firebase.ino`.
4. Replace `YOUR_WIFI_SSID` and `YOUR_WIFI_PASSWORD` with your network credentials.
5. Flash to the ESP32.

## Firebase Setup
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Enable **Realtime Database** and set rules to allow authenticated users.
4. Enable **Hosting**.
5. Update `firebaseConfig` in `frontend/src/firebase.js` with your project's credentials.
