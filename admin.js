/* ScrapLake — admin.js */
"use strict";

let ALL = [];
let statFilter = "";
let unsubscribe = null;

const STAT_DEFS = [
  { key: "today",     label: "Today's Requests", tone: "gold" },
  { key: "Pending",   label: "Pending",          tone: "gold" },
  { key: "Accepted",  label: "Accepted",         tone: "green" },
  { key: "Pickup Scheduled", label: "Pickup Scheduled", tone: "" },
  { key: "Driver Assigned",  label: "Driver Assigned",  tone: "" },
  { key: "On The Way",       label: "On The Way",       tone: "" },
  { key: "Picked Up",        label: "Picked Up",        tone: "" },
  { key: "Completed",        label: "Completed",        tone: "green" },
  { key: "Cancelled",        label: "Cancelled",        tone: "red" },
  { key: "Payment Pending",   label: "Payment Pending",   tone: "red" },
  { key: "Payment Completed", label: "Payment Completed", tone: "green" },
];

document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  initTools();
});

/* ============ Auth ============ */
function initAuth() {
  const loginWrap = document.getElementById("loginWrap");
  const dash = document.getElementById("dashboard");

  auth.onAuthStateChanged((user) => {
    loginWrap.hidden = !!user;
    dash.hidden = !user;
    if (user) {
      document.getElementById("adminWho").textContent = user.email;
      subscribe();
    } else if (unsubscribe) {
      unsubscribe(); unsubscribe = null;
    }
  });

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("loginError");
    err.hidden = true;
    try {
      await auth.signInWithEmailAndPassword(
        document.getElementById("lEmail").value.trim(),
        document.getElementById("lPass").value
      );
    } catch (ex) {
      err.textContent = "Sign-in failed. Check your email and password.";
      err.hidden = false;
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());
}

function subscribe() {
  unsubscribe = db.collection("requests").orderBy("createdAt", "desc").limit(500)
    .onSnapshot((snap) => {
      ALL = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      render();
    }, (err) => {
      console.error("Firestore listen error", err);
      document.getElementById("reqList").innerHTML =
        `<p class="empty">Could not load requests. Check your Firestore security rules.</p>`;
    });
}

/* ============ Tools ============ */
function initTools() {
  const statusSel = document.getElementById("statusFilter");
  statusSel.innerHTML += SL.STATUSES.map((s) => `<option>${s}</option>`).join("");

  ["searchInput", "statusFilter", "typeFilter"].forEach((id) =>
    document.getElementById(id).addEventListener("input", render)
  );
  document.getElementById("exportBtn").addEventListener("click", exportCsv);
  document.getElementById("printBtn").addEventListener("click", () => window.print());
}

/* ============ Render ============ */
function isToday(r) {
  const t = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
  return t && t.toDateString() === new Date().toDateString();
}

function filtered() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const st = document.getElementById("statusFilter").value;
  const ty = document.getElementById("typeFilter").value;
  return ALL.filter((r) => {
    if (q && !(`${r.name} ${r.mobile} ${r.altMobile} ${r.requestId}`.toLowerCase().includes(q))) return false;
    if (st && r.status !== st) return false;
    if (ty && r.type !== ty) return false;
    if (statFilter === "today" && !isToday(r)) return false;
    if (statFilter && statFilter !== "today") {
      if (statFilter.startsWith("Payment")) { if (r.paymentStatus !== statFilter) return false; }
      else if (r.status !== statFilter) return false;
    }
    return true;
  });
}

function render() {
  renderStats();
  renderTypeFilter();
  renderList(filtered());
}

function renderStats() {
  const grid = document.getElementById("statsGrid");
  const count = (k) =>
    k === "today" ? ALL.filter(isToday).length
    : k.startsWith("Payment") ? ALL.filter((r) => r.paymentStatus === k).length
    : ALL.filter((r) => r.status === k).length;

  grid.innerHTML = STAT_DEFS.map((s) => `
    <button class="stat ${statFilter === s.key ? "active" : ""}" data-key="${s.key}" data-tone="${s.tone}">
      <b>${count(s.key)}</b><span>${s.label}</span>
    </button>`).join("");
  grid.querySelectorAll(".stat").forEach((el) =>
    el.addEventListener("click", () => {
      statFilter = statFilter === el.dataset.key ? "" : el.dataset.key;
      render();
    })
  );
}

function renderTypeFilter() {
  const sel = document.getElementById("typeFilter");
  const current = sel.value;
  const types = [...new Set(ALL.map((r) => r.type).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">All scrap types</option>` + types.map((t) => `<option>${t}</option>`).join("");
  sel.value = current;
}

function badgeClass(status) {
  if (status === "Pending") return "pending";
  if (status === "Completed") return "done";
  if (status === "Cancelled") return "cancel";
  return "progress";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderList(rows) {
  const list = document.getElementById("reqList");
  document.getElementById("emptyMsg").hidden = rows.length > 0;

  list.innerHTML = rows.map((r) => {
    const when = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
    const waMsg = encodeURIComponent(
      `Hi ${r.name}, this is ScrapLake regarding your pickup request ${r.requestId || ""}. ` +
      `Please send photos of your scrap here so we can confirm the rate.`
    );
    return `
    <article class="req-card" data-id="${esc(r.requestId || r.id)}">
      <div class="req-head">
        <span class="req-id">${esc(r.requestId || r.id)}</span>
        <span class="badge ${badgeClass(r.status)}">${esc(r.status)}</span>
        <span class="badge pay">${esc(r.paymentStatus || "Payment Pending")}</span>
        <span style="margin-left:auto;font-size:.78rem;color:#64748B">${when ? when.toLocaleString("en-IN") : ""}</span>
      </div>
      <div class="req-meta">
        <span><b>${esc(r.name)}</b> · ${esc(r.mobile)}${r.altMobile ? " / " + esc(r.altMobile) : ""}${r.company ? " · " + esc(r.company) : ""}${r.gst ? " · GST " + esc(r.gst) : ""}</span>
        <span>${esc(r.category)} → <b>${esc(r.type)}</b> · ${esc(r.weightKg)} KG${r.quantity ? " · " + esc(r.quantity) : ""}</span>
        <span>📍 ${esc(r.address)}, ${esc(r.landmark || "")} ${esc(r.city)}, ${esc(r.state)} — ${esc(r.pincode)}</span>
        <span>🗓 ${esc(r.date)} · ${esc(r.time)}${r.notes ? " · 📝 " + esc(r.notes) : ""}</span>
      </div>
      <div class="req-actions">
        <a class="btn btn-primary" href="tel:+91${esc(r.mobile)}">📞 Call</a>
        <a class="btn btn-wa" href="https://wa.me/91${esc(r.mobile)}?text=${waMsg}" target="_blank" rel="noopener">💬 WhatsApp</a>
        ${r.mapsLink ? `<a class="btn btn-outline" href="${esc(r.mapsLink)}" target="_blank" rel="noopener">🗺 Map</a>` : ""}
        <select class="status-select" data-act="status">
          ${SL.STATUSES.map((s) => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <select class="status-select" data-act="payment">
          ${SL.PAYMENT_STATUSES.map((s) => `<option ${s === (r.paymentStatus || "Payment Pending") ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <button class="btn btn-outline" data-act="pdf">⬇ PDF</button>
        <button class="btn btn-outline" data-act="delete" style="color:#DC2626;border-color:#DC2626">Delete</button>
      </div>
    </article>`;
  }).join("");

  list.querySelectorAll("[data-act]").forEach((el) => {
    const card = el.closest(".req-card");
    const id = card.dataset.id;
    if (el.dataset.act === "status" || el.dataset.act === "payment") {
      el.addEventListener("change", () =>
        updateRequest(id, el.dataset.act === "status" ? { status: el.value } : { paymentStatus: el.value }));
    } else if (el.dataset.act === "delete") {
      el.addEventListener("click", () => {
        if (confirm(`Delete request ${id}? This cannot be undone.`)) deleteRequest(id);
      });
    } else if (el.dataset.act === "pdf") {
      el.addEventListener("click", () => printCard(card));
    }
  });
}

/* ============ Mutations ============ */
async function updateRequest(id, patch) {
  try {
    await db.collection("requests").doc(id).update(patch);
  } catch (e) {
    alert("Could not update. Check your admin permissions in Firestore rules.");
    console.error(e);
  }
}

async function deleteRequest(id) {
  try {
    await db.collection("requests").doc(id).delete();
  } catch (e) {
    alert("Could not delete. Check your admin permissions in Firestore rules.");
    console.error(e);
  }
}

/* ============ Export / print ============ */
function exportCsv() {
  const rows = filtered();
  const cols = ["requestId","name","mobile","altMobile","company","gst","category","type","weightKg",
    "quantity","address","landmark","city","state","pincode","date","time","status","paymentStatus","notes"];
  const escCsv = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(",")]
    .concat(rows.map((r) => cols.map((c) => escCsv(r[c])).join(",")))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `scraplake-requests-${new Date().toISOString().slice(0, 10)}.csv`,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

function printCard(card) {
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>ScrapLake Request</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#1E293B}
    h1{color:#0F766E;font-size:20px}
    .badge{background:#F59E0B22;padding:2px 8px;border-radius:99px;font-size:12px}</style>
    </head><body><h1>ScrapLake — Pickup Request</h1>${card.innerHTML}
    <script>document.querySelectorAll('.req-actions,select,button').forEach(e=>e.remove());
    window.print();<\/script></body></html>`);
  w.document.close();
}
