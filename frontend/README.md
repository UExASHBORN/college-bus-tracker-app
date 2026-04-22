# College Bus Tracker - Frontend

This directory contains the web interface for the live college bus tracking system.

## Structure
- `public/`: Contains the HTML files (`index.html`, `login.html`, `404.html`).
- `src/`: Contains the JavaScript modules (`app.js`, `firebase.js`, `map.js`).
- `styles/`: Contains the CSS (`main.css`).

## Local Development
To test the frontend locally, you can use any static file server from the root of the `frontend` directory.

For example, using Python:
```bash
cd frontend
python3 -m http.server 8000
```
Then visit `http://localhost:8000/public/login.html` in your browser.

## Deployment
This app is configured to be deployed using Firebase Hosting.
Run the following commands from the `firebase/` directory:
```bash
cd firebase
firebase deploy --only hosting
```
