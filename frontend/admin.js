const API_BASE = "http://127.0.0.1:8000";
const $ = (id) => document.getElementById(id);

function getToken() { return localStorage.getItem("skywatch_token"); }
function clearToken() { localStorage.removeItem("skywatch_token"); }
function setOut(obj) { $("out").textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2); }

async function apiGet(path) {
  const token = getToken();
  if (!token) throw new Error("No token. Go login first.");

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${path} failed (${res.status}): ${txt}`);
  }
  return await res.json();
}

$("logoutBtn").onclick = () => {
  clearToken();
  location.href = "./index.html";
};

async function loadMe() {
  try {
    const me = await apiGet("/api/me");
    $("whoami").textContent = `Logged in as ${me.email} (${me.role})`;
    setOut(me);
  } catch (e) {
    $("whoami").textContent = "Not logged in.";
    setOut(e.message);
    // do NOT auto-redirect; show message instead
  }
}

$("loadMeBtn").onclick = loadMe;

// auto load
loadMe();
