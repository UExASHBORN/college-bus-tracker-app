let currentUser = null;

// ── Auth Gate ──
auth.onAuthStateChanged(user => {
  const isLoginPage = window.location.pathname.includes("login.html");

  if (!user) {
    if (!isLoginPage) {
      window.location.replace("login.html");
    }
    return;
  }

  // If user is logged in and on login page, redirect to index
  if (isLoginPage) {
    window.location.replace("index.html");
    return;
  }

  // --- Index Page Auth Logic ---
  currentUser = user;
  document.getElementById("auth-loading").style.display = "none";
  document.getElementById("user-email").textContent = user.email;

  if (window.ADMIN_EMAILS.includes(user.email)) {
    document.getElementById("admin-badge").style.display = "inline-block";
    document.getElementById("admin-panel").style.display = "block";
    setupAdminPanel();
  }
});

// ── Logout (Index Page) ──
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    window.location.replace("login.html");
  });
}

// ── Firebase Location Listener (Index Page) ──
function listenToFirebase() {
  if (!window.db) return;

  db.ref("bus/location").on("value", (snapshot) => {
    const data = snapshot.val();

    if (!data || !data.lat || !data.lng) {
      document.getElementById("dot").className = "lost";
      document.getElementById("status-text").textContent = "No GPS fix";
      document.getElementById("no-gps").style.display = "block";
      document.getElementById("gps-status").textContent = "No satellite fix";
      return;
    }

    document.getElementById("no-gps").style.display = "none";
    const pos = { lat: data.lat, lng: data.lng };
    if (window.marker) window.marker.setPosition(pos);

    if (window.firstFix && window.map) {
      window.map.setCenter(pos);
      window.map.setZoom(17);
      window.firstFix = false;
    }

    document.getElementById("dot").className = "live";
    document.getElementById("status-text").textContent = "Live";
    document.getElementById("last-update").textContent = new Date().toLocaleTimeString();
    document.getElementById("satellites").textContent = data.satellites || "—";
    document.getElementById("lat-val").textContent = data.lat.toFixed(6);
    document.getElementById("lng-val").textContent = data.lng.toFixed(6);
    document.getElementById("gps-status").textContent = "GPS locked ✅";

  }, (error) => {
    document.getElementById("dot").className = "lost";
    document.getElementById("status-text").textContent = "Connection error";
    console.error("Firebase error:", error);
  });

  // Listen to bus active/inactive status
  db.ref("bus/status").on("value", (snap) => {
    const status = snap.val();
    const toggle = document.getElementById("bus-active-toggle");
    if (toggle) toggle.checked = (status === "active");
  });
}
window.listenToFirebase = listenToFirebase;

// ── Admin Panel (Index Page) ──
function setupAdminPanel() {
  document.getElementById("panel-header").addEventListener("click", () => {
    document.getElementById("admin-panel").classList.toggle("collapsed");
  });

  document.getElementById("bus-active-toggle").addEventListener("change", async (e) => {
    const status = e.target.checked ? "active" : "inactive";
    await db.ref("bus/status").set(status);
    showFeedback(status === "active" ? "🟢 Bus marked as running" : "🔴 Bus marked as inactive");
  });

  document.getElementById("push-loc-btn").addEventListener("click", async () => {
    const lat = parseFloat(document.getElementById("admin-lat").value);
    const lng = parseFloat(document.getElementById("admin-lng").value);

    if (isNaN(lat) || isNaN(lng)) {
      showFeedback("⚠️ Enter valid lat & lng values", true);
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      showFeedback("⚠️ Coordinates out of valid range", true);
      return;
    }

    await db.ref("bus/location").set({
      lat,
      lng,
      satellites: 0,
      timestamp: Math.floor(Date.now() / 1000),
      source: "manual"
    });
    showFeedback("📍 Location pushed to Firebase!");
  });

  document.getElementById("clear-loc-btn").addEventListener("click", async () => {
    await db.ref("bus/location").remove();
    document.getElementById("admin-lat").value = "";
    document.getElementById("admin-lng").value = "";
    showFeedback("🗑 Location data cleared");
  });
}

let feedbackTimer;
function showFeedback(msg, isError = false) {
  const el = document.getElementById("panel-feedback");
  el.textContent = msg;
  el.style.color = isError ? "#fca5a5" : "#22c55e";
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => { el.textContent = ""; }, 3000);
}


// ── Login Page Logic ──
const loginForm = document.getElementById("login-form");
if (loginForm) {
  const btn = document.getElementById("login-btn");
  const errEl = document.getElementById("error-msg");

  function showError(msg) {
    errEl.textContent = msg;
    errEl.style.display = "block";
    errEl.style.animation = "none";
    void errEl.offsetWidth;
    errEl.style.animation = "";
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.style.display = "none";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showError("Please fill in all fields.");
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Signing in…';

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = "Sign In";
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          showError("❌ Incorrect email or password."); break;
        case "auth/invalid-email":
          showError("❌ Please enter a valid email address."); break;
        case "auth/too-many-requests":
          showError("⚠️ Too many failed attempts. Try again later."); break;
        case "auth/network-request-failed":
          showError("⚠️ Network error. Check your connection."); break;
        default:
          showError("❌ " + err.message);
      }
    }
  });

  // Forgot Password
  const forgotLink = document.getElementById("forgot-link");
  const resetSection = document.getElementById("reset-section");
  const resetBtn = document.getElementById("reset-btn");
  const resetFeedback = document.getElementById("reset-feedback");

  if (forgotLink) {
    forgotLink.addEventListener("click", () => {
      const isVisible = resetSection.style.display === "block";
      resetSection.style.display = isVisible ? "none" : "block";
      forgotLink.textContent = isVisible ? "Forgot password?" : "← Back to sign in";
      resetFeedback.style.display = "none";
      const emailVal = document.getElementById("email").value.trim();
      if (emailVal) document.getElementById("reset-email").value = emailVal;
    });

    resetBtn.addEventListener("click", async () => {
      const email = document.getElementById("reset-email").value.trim();
      resetFeedback.style.display = "none";

      if (!email) {
        resetFeedback.className = "error";
        resetFeedback.textContent = "⚠️ Please enter your email address.";
        resetFeedback.style.display = "block";
        return;
      }

      resetBtn.disabled = true;
      resetBtn.innerHTML = '<span class="spinner"></span>Sending…';

      try {
        await auth.sendPasswordResetEmail(email);
        resetFeedback.className = "success";
        resetFeedback.textContent = "✅ Reset link sent! Check your inbox.";
        resetFeedback.style.display = "block";
        resetBtn.innerHTML = "📧 Send Reset Link";
        resetBtn.disabled = false;
      } catch (err) {
        resetBtn.disabled = false;
        resetBtn.innerHTML = "📧 Send Reset Link";
        resetFeedback.className = "error";
        switch (err.code) {
          case "auth/user-not-found":
            resetFeedback.textContent = "❌ No account found with this email."; break;
          case "auth/invalid-email":
            resetFeedback.textContent = "❌ Please enter a valid email address."; break;
          default:
            resetFeedback.textContent = "❌ " + err.message;
        }
        resetFeedback.style.display = "block";
      }
    });
  }
}
