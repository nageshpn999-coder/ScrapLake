/* ScrapLake — track.js */
"use strict";

const FLOW = ["Pending", "Accepted", "Pickup Scheduled", "Driver Assigned", "On The Way", "Picked Up", "Completed"];

document.addEventListener("DOMContentLoaded", () => {
  Lang.set(Lang.current);
  document.querySelectorAll(".lang-btn").forEach((b) => b.addEventListener("click", () => Lang.set(b.dataset.lang)));

  document.getElementById("trackForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = document.getElementById("trackQuery").value.trim();
    const results = document.getElementById("trackResults");
    const empty = document.getElementById("trackEmpty");
    results.innerHTML = "";
    empty.hidden = true;

    let rows = [];
    try {
      if (FIREBASE_READY) {
        if (/^\d{10}$/.test(q)) {
          const snap = await db.collection("requests").where("mobile", "==", q)
            .orderBy("createdAt", "desc").limit(10).get();
          rows = snap.docs.map((d) => d.data());
        } else {
          const doc = await db.collection("requests").doc(q.toUpperCase()).get();
          if (doc.exists) rows = [doc.data()];
        }
      } else {
        const all = JSON.parse(localStorage.getItem("sl_demo_requests") || "[]");
        rows = all.filter((r) => r.mobile === q || (r.requestId || "").toUpperCase() === q.toUpperCase());
      }
    } catch (err) { console.error(err); }

    if (!rows.length) { empty.hidden = false; return; }
    results.innerHTML = rows.map(renderResult).join("");
  });
});

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderResult(r) {
  const cancelled = r.status === "Cancelled";
  const idx = FLOW.indexOf(r.status);
  const steps = FLOW.map((s, i) => `
    <li style="display:flex;gap:.7rem;align-items:flex-start;padding:.35rem 0;opacity:${i <= idx ? 1 : 0.4}">
      <span style="width:22px;height:22px;border-radius:50%;flex:none;display:grid;place-items:center;
        font-size:.7rem;color:#fff;background:${i <= idx ? "var(--emerald)" : "var(--line)"}">${i <= idx ? "✓" : ""}</span>
      <span style="font-size:.9rem;font-weight:${i === idx ? 700 : 500}">${s}</span>
    </li>`).join("");

  return `
  <article class="req-card" style="margin-bottom:1rem">
    <div class="req-head">
      <span class="req-id">${esc(r.requestId)}</span>
      <span class="badge ${cancelled ? "cancel" : r.status === "Completed" ? "done" : "progress"}">${esc(r.status)}</span>
      <span class="badge pay">${esc(r.paymentStatus || "Payment Pending")}</span>
    </div>
    <div class="req-meta">
      <span>${esc(r.category)} → <b>${esc(r.type)}</b> · ${esc(r.weightKg)} KG</span>
      <span>🗓 ${esc(r.date)} · ${esc(r.time)}</span>
    </div>
    ${cancelled
      ? `<p style="color:var(--red);font-weight:600;font-size:.9rem">This request was cancelled. Call us to rebook.</p>`
      : `<ol style="list-style:none;margin-top:.5rem">${steps}</ol>`}
  </article>`;
}
