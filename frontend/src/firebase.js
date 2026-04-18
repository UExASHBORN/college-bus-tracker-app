// ── Config ──
const ADMIN_EMAILS = [
  "mohammadzaid7889@gmail.com",
  "adeelarifknp@gmail.com",
  "aarfeen2003@gmail.com"
];

const firebaseConfig = {
  apiKey: "AIzaSyCq-EcP5gLWQlTj4-YMBAGGouD9T0b2Qv0",
  authDomain: "college-bus-tracker-b6e39.firebaseapp.com",
  databaseURL: "https://college-bus-tracker-b6e39-default-rtdb.firebaseio.com",
  projectId: "college-bus-tracker-b6e39",
  storageBucket: "college-bus-tracker-b6e39.firebasestorage.app",
  messagingSenderId: "310600056003",
  appId: "1:310600056003:web:5ee6bd72ce3664f46a7676"
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
window.auth = auth;
window.db = db;
