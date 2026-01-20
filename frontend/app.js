// GUARANTEED WORKING: token storage + auth headers
const API_BASE = "http://127.0.0.1:8000";

const $ = (id) => document.getElementById(id);

function setStatus(msg) { $("status").textContent = msg; }
function setOut(obj) { $("out").textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2); }

function getToken() { return localStorage.getItem("skywatch_token"); }
function setToken(t) { localStorage.setItem("skywatch_token", t); }
function clearToken() { localStorage.removeItem("skywatch_token"); }

async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login failed (${res.status}): ${txt}`);
  }

  const data = await res.json();
  const token = data.token || data.access_token;
  if (!token) throw new Error("Login ok but server returned no token field");

  setToken(token);

  // proof it saved:
  console.log("TOKEN SAVED:", token);
  console.log("TOKEN CHECK:", getToken());
  return token;
}

async function apiGet(path) {
  const token = getToken();
  if (!token) throw new Error("No token saved. Please login.");

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${path} failed (${res.status}): ${txt}`);
  }
  return await res.json();
}

// Wire buttons (these IDs match index.html)
$("loginBtn").onclick = async () => {
  try {
    setStatus("Logging in…");
    const email = $("email").value.trim();
    const password = $("password").value;
    await login(email, password);
    setStatus("Logged in. Token saved to localStorage.skywatch_token");
    setOut({ token_saved: true, token_preview: (getToken() || "").slice(0, 18) + "…" });
  } catch (e) {
    setStatus(e.message);
    setOut(e.message);
  }
};

$("logoutBtn").onclick = () => {
  clearToken();
  setStatus("Logged out (token cleared).");
  setOut("(output)");
};

$("meBtn").onclick = async () => {
  try {
    const me = await apiGet("/api/me");
    setOut(me);
    setStatus("OK: /api/me");
  } catch (e) {
    setStatus(e.message);
    setOut(e.message);
  }
};

$("airBtn").onclick = async () => {
  try {
    // sample bbox
    const lamin = 33.9, lomin = -100.7, lamax = 48.9, lomax = -74.5;
    const data = await apiGet(`/api/aircraft?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`);
    setOut(data);
    setStatus("OK: /api/aircraft");
  } catch (e) {
    setStatus(e.message);
    setOut(e.message);
  }
};

// On load: show token status
if (getToken()) {
  setStatus("Token exists. Click GET /api/me to verify.");
} else {
  setStatus("Please login.");
}
