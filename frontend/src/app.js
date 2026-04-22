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

  const isAdmin = window.ADMIN_EMAILS && window.ADMIN_EMAILS.includes(user.email);
  const isDriver = window.DRIVER_EMAILS && window.DRIVER_EMAILS.includes(user.email);

  if (isAdmin) {
    document.getElementById("admin-badge").style.display = "inline-block";
    document.getElementById("admin-panel").style.display = "block";
    setupAdminPanel();
  } 
  
  if (isDriver) {
    document.getElementById("driver-badge").style.display = "inline-block";
    document.getElementById("driver-panel").style.display = "block";
    setupDriverPanel();
  }

  // Everyone sees the Route UI
  setupRouteUI();
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
    if (window.marker) window.marker.setLatLng([data.lat, data.lng]);

    if (window.firstFix && window.map) {
      window.map.setView([data.lat, data.lng], 17);
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


}
window.listenToFirebase = listenToFirebase;

// ── Admin Panel (Index Page) ──
function setupAdminPanel() {
  document.getElementById("panel-header").addEventListener("click", () => {
    document.getElementById("admin-panel").classList.toggle("collapsed");
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
  if(el) {
    el.textContent = msg;
    el.style.color = isError ? "#fca5a5" : "#22c55e";
  }
  const driverEl = document.getElementById("driver-feedback");
  if(driverEl) {
    driverEl.textContent = msg;
    driverEl.style.color = isError ? "#fca5a5" : "#22c55e";
  }
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => { 
    if(el) el.textContent = ""; 
    if(driverEl) driverEl.textContent = ""; 
  }, 3000);
}

// ── Driver Panel Logic ──
function setupDriverPanel() {
  document.getElementById("driver-panel-header").addEventListener("click", () => {
    document.getElementById("driver-panel").classList.toggle("collapsed");
  });

  const stopSelect = document.getElementById("stop-select");
  const studentSelect = document.getElementById("student-select");

  // Populate stops
  if (window.ROUTE_STOPS) {
    window.ROUTE_STOPS.forEach(stop => {
      const opt = document.createElement("option");
      opt.value = stop.id;
      opt.textContent = `${stop.id}. ${stop.name}`;
      stopSelect.appendChild(opt);
    });
  }

  // Update students when stop changes
  stopSelect.addEventListener("change", () => {
    studentSelect.innerHTML = "";
    const selectedStopId = parseInt(stopSelect.value);
    const students = window.MOCK_STUDENTS.filter(s => s.stopId === selectedStopId);
    if (students.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "-- No students for this stop --";
      studentSelect.appendChild(opt);
    } else {
      students.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.name;
        studentSelect.appendChild(opt);
      });
    }
  });

  // Trigger initial load
  stopSelect.dispatchEvent(new Event("change"));

  // Mark attendance
  document.getElementById("mark-attendance-btn").addEventListener("click", async () => {
    const stopId = stopSelect.value;
    const studentId = studentSelect.value;
    const status = document.getElementById("status-select").value;
    
    if (!studentId || studentId === "" || studentId.includes("No students")) {
      showFeedback("⚠️ No student selected", true);
      return;
    }
    
    const today = new Date().toISOString().split("T")[0];
    const path = `bus/attendance/${today}/${stopId}/${studentId}`;
    
    try {
      await db.ref(path).set({
        timestamp: Math.floor(Date.now() / 1000),
        status: status,
        markedBy: currentUser.email
      });
      showFeedback(`✅ ${studentSelect.options[studentSelect.selectedIndex].text} marked ${status}!`);
    } catch (e) {
      console.error("Attendance Error:", e);
      showFeedback("❌ Failed to save attendance", true);
    }
  });

  // Mark stop as reached
  const reachBtn = document.getElementById("reach-stop-btn");
  if (reachBtn) {
    reachBtn.addEventListener("click", async () => {
      const stopId = stopSelect.value;
      const today = new Date().toISOString().split("T")[0];
      
      try {
        await db.ref(`bus/routeProgress/${today}/${stopId}`).set({
          reached: true,
          time: new Date().toLocaleTimeString()
        });
        await db.ref("bus/currentStop").set(parseInt(stopId));
        showFeedback(`📍 Stop ${stopId} marked as reached!`);
      } catch (e) {
        showFeedback("❌ Failed to mark stop", true);
      }
    });
  }
}

// ── Route UI Logic ──
function setupRouteUI() {
  const routeBtn = document.getElementById("route-btn");
  const routeSidebar = document.getElementById("route-sidebar");
  const closeRouteBtn = document.getElementById("close-route");
  const routeList = document.getElementById("route-list");

  if (routeBtn && routeSidebar && closeRouteBtn) {
    routeBtn.addEventListener("click", () => {
      routeSidebar.classList.add("show");
    });
    closeRouteBtn.addEventListener("click", () => {
      routeSidebar.classList.remove("show");
    });
  }

  function renderRoute(currentStopId = 0, attendanceData = {}, progressData = {}) {
    if (!routeList || !window.ROUTE_STOPS) return;
    routeList.innerHTML = "";
    
    const adminAttendanceView = document.getElementById("admin-attendance-view");
    let adminLogHTML = "";

    window.ROUTE_STOPS.forEach(stop => {
      const isReached = progressData[stop.id] && progressData[stop.id].reached;
      const li = document.createElement("li");
      li.className = "route-item";
      if (isReached) {
        li.classList.add("completed");
      }
      
      const stopAttendance = attendanceData[stop.id] || {};
      const presentCount = Object.keys(stopAttendance).filter(id => stopAttendance[id].status === "Present").length;
      const totalStudents = window.MOCK_STUDENTS.filter(s => s.stopId === stop.id).length;

      const checkmark = isReached ? `<span style="color: #10b981; margin-left: 8px;">✅ Reached</span>` : "";

      li.innerHTML = `
        <div class="route-time">${stop.time} ${checkmark}</div>
        <div class="route-name">${stop.name}</div>
        <div class="route-stats">👥 ${presentCount}/${totalStudents} Present</div>
      `;
      routeList.appendChild(li);

      if (Object.keys(stopAttendance).length > 0) {
        adminLogHTML += `<div style="margin-bottom: 8px; background: rgba(30, 41, 59, 0.5); padding: 8px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="color: #fbbf24; font-weight: 700; font-size: 11px; text-transform: uppercase;">${stop.name} (${stop.time}) ${isReached ? "✓" : ""}</div>`;
        
        Object.keys(stopAttendance).forEach(studentId => {
          const student = window.MOCK_STUDENTS.find(s => s.id === studentId);
          if (student) {
            const isPresent = stopAttendance[studentId].status === "Present";
            const icon = isPresent ? "✅" : "❌";
            const color = isPresent ? "#10b981" : "#ef4444";
            adminLogHTML += `<div style="color: ${color}; font-size: 13px; margin-top: 4px;">${icon} ${student.name}</div>`;
          }
        });
        
        adminLogHTML += `</div>`;
      }
    });

    if (adminAttendanceView) {
      adminAttendanceView.innerHTML = adminLogHTML || "<p style='text-align:center; padding: 20px 0;'>No attendance records for today.</p>";
    }
  }

  // Initial Sidebar render
  renderRoute(0, {}, {});

  // Listen for current stop, attendance, and progress
  const today = new Date().toISOString().split("T")[0];
  let currentStopId = 0;
  let attendanceData = {};
  let progressData = {};

  if (window.db) {
    const today = new Date().toISOString().split("T")[0];

    // Daily Reset Logic: Check if currentStop belongs to a previous day
    db.ref("bus/lastResetDate").once("value", snap => {
      const lastReset = snap.val();
      if (lastReset !== today) {
        // It's a new day! Reset progress.
        db.ref("bus/currentStop").set(0);
        db.ref("bus/lastResetDate").set(today);
        console.log("New day detected: Progress reset.");
      }
    });

    db.ref("bus/currentStop").on("value", snap => {
      currentStopId = snap.val() || 0;
      renderRoute(currentStopId, attendanceData, progressData);
    });
    db.ref(`bus/attendance/${today}`).on("value", snap => {
      attendanceData = snap.val() || {};
      renderRoute(currentStopId, attendanceData, progressData);
    });
    db.ref(`bus/routeProgress/${today}`).on("value", snap => {
      progressData = snap.val() || {};
      renderRoute(currentStopId, attendanceData, progressData);
    });
  }
}

// ── Emergency SOS Logic ──
const sosBtn = document.getElementById("sos-btn");
const emergencyModal = document.getElementById("emergency-modal");
const closeSosBtn = document.getElementById("close-sos");

if (sosBtn && emergencyModal && closeSosBtn) {
  sosBtn.addEventListener("click", () => {
    emergencyModal.classList.add("show");
  });

  closeSosBtn.addEventListener("click", () => {
    emergencyModal.classList.remove("show");
  });

  // Close when clicking outside modal content
  emergencyModal.addEventListener("click", (e) => {
    if (e.target === emergencyModal) {
      emergencyModal.classList.remove("show");
    }
  });
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
    // ... forgot password code ...
  }

  // Login Toggle Logic
  const typeUser = document.getElementById("type-user");
  const typeDriver = document.getElementById("type-driver");
  if (typeUser && typeDriver) {
    typeUser.addEventListener("click", () => {
      typeUser.classList.add("active");
      typeDriver.classList.remove("active");
      showError(""); // clear any errors
    });
    typeDriver.addEventListener("click", () => {
      typeDriver.classList.add("active");
      typeUser.classList.remove("active");
      showError(""); // clear any errors
    });
  }
}
