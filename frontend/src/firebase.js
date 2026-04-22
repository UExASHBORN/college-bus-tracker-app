// ── Config ──
const ADMIN_EMAILS = [
  "mohammadzaid7889@gmail.com",
  "adeelarifknp@gmail.com",
  "aarfeen2003@gmail.com"
];

const DRIVER_EMAILS = [
  "driver@iul.ac.in"
];

const firebaseConfig = {
  apiKey: "AIzaSyCAmA0QspxySSr4ybIdc14qt9uLUqo67n0",
  authDomain: "college-bus-tracker-app-d318a.firebaseapp.com",
  databaseURL: "https://college-bus-tracker-app-d318a-default-rtdb.firebaseio.com",
  projectId: "college-bus-tracker-app-d318a",
  storageBucket: "college-bus-tracker-app-d318a.firebasestorage.app",
  messagingSenderId: "962338128247",
  appId: "1:962338128247:web:44e28bc071fcb3868fa172"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
// db is not used in login page, but safe to initialize
let db = null;
if (firebase.database) {
  db = firebase.database();
}

// Make globally available
window.ADMIN_EMAILS = ADMIN_EMAILS;
window.DRIVER_EMAILS = DRIVER_EMAILS;
window.auth = auth;
window.db = db;
