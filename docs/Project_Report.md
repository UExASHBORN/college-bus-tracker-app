# IUL Bus Tracking System - Project Report

## 1. Project Overview
The **IUL Bus Tracking System** is a full-stack IoT web application designed to provide real-time GPS tracking of college buses. The system bridges physical hardware (ESP32 and NEO-6M GPS module) with a secure, cloud-based web interface, allowing students to track the bus and administrators to manage its status.

This report details the core technologies implemented, focusing specifically on the cloud infrastructure, authentication, security, and deployment pipelines.

---

## 2. Firebase Realtime Database (The Cloud Backend)
To achieve "live" tracking without requiring the user to constantly refresh the page, we utilized **Firebase Realtime Database**. This is a NoSQL, cloud-hosted database that syncs data across all clients in real-time using WebSockets.

### How it Works:
1. **Data Ingestion (ESP32):** The ESP32 microcontroller onboard the bus reads satellite coordinates from the NEO-6M GPS module. Every 5 seconds, the ESP32 pushes a JSON payload containing `lat` (latitude), `lng` (longitude), and `satellites` (signal strength) to the Firebase cloud under the `bus/location` path.
2. **Real-time Syncing (Web App):** The web application establishes a continuous, open connection to the Firebase cloud. Instead of "asking" the server for updates, Firebase actively "pushes" new data to the web app the millisecond the ESP32 updates the database.
3. **Data Structure:** 
   We implemented a lightweight JSON tree structure to minimize bandwidth:
   - `bus/location`: Stores the current coordinates and timestamp.
   - `bus/status`: Stores a simple string (`"active"` or `"inactive"`) controlled by administrators to indicate if the bus is currently running its route.

---

## 3. Security and Authentication
A critical requirement of the project was ensuring that the tracker is only accessible to authorized individuals, and that only administrators can alter the system's state. We achieved this using **Firebase Authentication**.

### Email/Password Authentication
We configured Firebase Auth to use an Email & Password provider. This allowed us to build a secure Login Portal that acts as a gatekeeper. 
- **Auth Guarding:** When a user visits the tracking page, a script instantly checks their authentication state. If no valid login token is found, the user is forcefully redirected back to the login page.
- **Forgot Password Flow:** We integrated Firebase's automated `sendPasswordResetEmail` API. If a user forgets their password, they can trigger an email directly to their inbox containing a secure link to reset their credentials, completely removing the need for manual IT intervention.

### Role-Based Access Control (Admin vs. Student)
To differentiate between regular users (students) and system managers (admins), we implemented client-side Role-Based Access Control (RBAC).
- A predefined list of authorized admin email addresses (e.g., `mohammadzaid7889@gmail.com`, `adeelarifknp@gmail.com`) is checked during the login process.
- **Student View:** A regular student sees only the live map, bus coordinates, and connection status.
- **Admin View:** If an admin logs in, the UI dynamically injects an **Admin Badge** and an interactive **Admin Panel**. This panel allows admins to:
  - Toggle the bus status (Running/Inactive).
  - Manually override the GPS coordinates in case of hardware failure.
  - Clear the location data entirely.

---

## 4. Google Maps API Integration
To visualize the raw GPS data, we integrated the **Google Maps JavaScript API**. 
- When the Firebase Realtime listener triggers a new coordinate update, the map dynamically updates a custom SVG bus icon to the new latitude and longitude.
- We applied a custom JSON styling array to the Google Map instance to give it a sleek, dark-themed cinematic aesthetic that perfectly matches the rest of the application's UI.

---

## 5. Deployment and Hosting
Rather than running a traditional web server (like Apache or Nginx), we utilized **Firebase Hosting**. Firebase Hosting provides fast, secure, and reliable hosting for web apps via a global Content Delivery Network (CDN).

### The Deployment Process:
1. **Initialization:** The project was linked to the specific Firebase Cloud project (`college-bus-tracker-b6e39`).
2. **Configuration (`firebase.json`):** We defined the hosting rules. Notably, we configured URL "rewrites" so that no matter how the files are structured locally, the cloud server seamlessly routes traffic from the root URL (`/`) directly to the main `index.html` file.
3. **Pushing to Cloud:** By running the `firebase deploy --only hosting` command in the terminal, the Firebase CLI bundles the HTML, CSS, and JavaScript files, compresses them, and uploads them to Google's edge servers. The application is instantly made live at an auto-provisioned SSL-secured URL (`https://college-bus-tracker-b6e39.web.app`).

---

## 6. Version Control and Code Management
To ensure the project's codebase is safely backed up and its evolution is tracked, we utilized **Git** and **GitHub**.

- **Tracking Changes:** Every time a significant feature was completed (e.g., adding the login page, building the admin panel, implementing the new background UI), the code was "committed" via Git. This creates a snapshot of the code at that exact moment in time.
- **Cloud Backup:** The committed code was then pushed (`git push`) to a remote GitHub repository (`iamzaid25/college-bus-tracker`). 
- **Benefits:** This provides a secure, off-site backup of the source code. Furthermore, if a future update breaks the application, Git allows the developer to instantly "roll back" to a previously working snapshot.
