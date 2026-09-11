/* ScrapLake — app.js (home page) */
"use strict";

/* ============ Data ============ */
const CATEGORIES = [
  { name: "Ferrous Scrap", ic: "🧲" }, { name: "Non-Ferrous Scrap", ic: "🥉" },
  { name: "Industrial Scrap", ic: "🏭" }, { name: "Factory Scrap", ic: "⚙️" },
  { name: "Construction Scrap", ic: "🏗️" }, { name: "Commercial Scrap", ic: "🏢" },
  { name: "Household Scrap", ic: "🏠" }, { name: "Automobile Scrap", ic: "🚗" },
  { name: "Machinery Scrap", ic: "🔩" }, { name: "Electrical Scrap", ic: "🔌" },
  { name: "Electronic Scrap (E-Waste)", ic: "💻" }, { name: "Plastic Scrap", ic: "🧴" },
  { name: "Paper Scrap", ic: "📦" }, { name: "Metal Scrap", ic: "🔧" },
  { name: "Mixed Scrap", ic: "🗑️" },
];

const SCRAP_TYPES = [
  "MS Iron Scrap","Steel Scrap","Stainless Steel Scrap","Cast Iron Scrap","TMT Scrap",
  "MS Plate Scrap","MS Angle Scrap","MS Channel Scrap","MS Beam Scrap","GI Scrap",
  "GI Sheet Scrap","Iron Rod Scrap","Steel Pipe Scrap","Iron Pipe Scrap","Copper Scrap",
  "Copper Wire Scrap","Copper Cable Scrap","Brass Scrap","Brass Fittings","Aluminium Scrap",
  "Aluminium Sheet","Aluminium Profile","Aluminium Wire","Lead Scrap","Zinc Scrap",
  "Nickel Scrap","Tin Scrap","Battery Scrap","UPS Battery Scrap","Inverter Battery Scrap",
  "Industrial Battery Scrap","Electric Motor Scrap","Generator Scrap","Transformer Scrap",
  "Compressor Scrap","Boiler Scrap","Pump Scrap","Lathe Machine Scrap","Industrial Machine Scrap",
  "Factory Equipment Scrap","AC Scrap","Air Cooler Scrap","Refrigerator Scrap","Washing Machine Scrap",
  "Microwave Scrap","Television Scrap","Computer Scrap","CPU Scrap","Monitor Scrap","Laptop Scrap",
  "Printer Scrap","Scanner Scrap","Photocopier Scrap","Server Scrap","Mobile Phone Scrap",
  "Tablet Scrap","Router Scrap","CCTV Scrap","Solar Panel Scrap","Electrical Panel Scrap",
  "Electrical Wire Scrap","Electrical Cable Scrap","Plastic Scrap","PVC Scrap","HDPE Scrap",
  "LDPE Scrap","Paper Scrap","Office Paper Scrap","Books Scrap","Newspaper Scrap","Cardboard Scrap",
  "Glass Scrap","Bottle Scrap","Textile Scrap","Fabric Scrap","Rubber Scrap","Tyre Scrap",
  "Vehicle Scrap","Car Scrap","Bike Scrap","Bus Scrap","Truck Scrap","Tractor Scrap","JCB Scrap",
  "Excavator Scrap","Crane Scrap","Forklift Scrap","Container Scrap","Shipping Container Scrap",
  "Construction Material Scrap","Demolition Scrap","Old Furniture Scrap","Hospital Equipment Scrap",
  "Hotel Equipment Scrap","Office Furniture Scrap","Warehouse Scrap","Agricultural Equipment Scrap",
  "Farm Machinery Scrap","Borewell Pipe Scrap","Mixed Scrap","Other",
];

/* ============ Boot ============ */
document.addEventListener("DOMContentLoaded", () => {
  Lang.set(Lang.current);
  document.getElementById("year").textContent = new Date().getFullYear();

  buildNav();
  buildCategories();
  buildFormOptions();
  initReveal();
  initForm();
});

/* ============ Nav / language ============ */
function buildNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav?.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });
  document.querySelectorAll(".lang-btn").forEach((b) =>
    b.addEventListener("click", () => Lang.set(b.dataset.lang))
  );
}

/* ============ Categories ============ */
function buildCategories() {
  const grid = document.getElementById("catGrid");
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map((c) => `
    <a class="cat-item reveal" href="#book" data-cat="${c.name}">
      <span class="ci-ic">${c.ic}</span><span>${c.name}</span>
    </a>`).join("");
  grid.addEventListener("click", (e) => {
    const item = e.target.closest(".cat-item");
    if (item) document.getElementById("fCat").value = item.dataset.cat;
  });
}

function buildFormOptions() {
  const catSel = document.getElementById("fCat");
  const typeSel = document.getElementById("fType");
  if (catSel) catSel.innerHTML =
    `<option value="">—</option>` + CATEGORIES.map((c) => `<option>${c.name}</option>`).join("");
  if (typeSel) typeSel.innerHTML =
    `<option value="">—</option>` + SCRAP_TYPES.map((t) => `<option>${t}</option>`).join("");
  const dateInput = document.getElementById("fDate");
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);
}

/* ============ Reveal on scroll ============ */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ============ Form ============ */
function initForm() {
  const form = document.getElementById("pickupForm");
  if (!form) return;

  /* Geolocation → maps link */
  document.getElementById("geoBtn").addEventListener("click", () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("fMaps").value =
          `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      },
      () => setFieldError(document.getElementById("fMaps"), Lang.t("err_generic"))
    );
  });

  /* Live minimum-weight validation */
  const weightInput = document.getElementById("fWeight");
  weightInput.addEventListener("input", () => {
    const v = parseFloat(weightInput.value);
    setFieldError(weightInput, v && v < SL.MIN_WEIGHT_KG ? Lang.t("err_weight_min") : "");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    const btn = document.getElementById("submitBtn");
    const errBox = document.getElementById("formError");
    errBox.hidden = true;
    btn.disabled = true;
    btn.textContent = Lang.t("f_submitting");

    const requestId = makeRequestId();
    const data = collect(form, requestId);

    try {
      await db.collection("requests").doc(requestId).set(data);

      form.hidden = true;
      const box = document.getElementById("successBox");
      document.getElementById("successMsg").textContent =
        Lang.t("success_body").replace("{id}", requestId);

      /* WhatsApp photo prompt, prefilled with the request details */
      const waText = encodeURIComponent(
        `ScrapLake — Request ${requestId}\n` +
        `Name: ${data.name}\nScrap: ${data.type} (${data.weightKg} KG)\n` +
        `City: ${data.city}\n\n` +
        `Here are photos of my scrap:`
      );
      const waBtn = document.getElementById("waPhotoBtn");
      if (waBtn) waBtn.href = `https://wa.me/${SL.WHATSAPP}?text=${waText}`;

      box.hidden = false;
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      console.error(err);
      errBox.textContent = Lang.t("err_generic");
      errBox.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = Lang.t("f_submit");
    }
  });
}

function collect(form, requestId) {
  const v = (id) => document.getElementById(id).value.trim();
  return {
    requestId,
    name: v("fName"), mobile: v("fMobile"), altMobile: v("fAlt"),
    company: v("fCompany"), gst: v("fGst").toUpperCase(),
    category: v("fCat"), type: v("fType"),
    weightKg: parseFloat(v("fWeight")), quantity: v("fQty"),
    address: v("fAddress"), mapsLink: v("fMaps"), landmark: v("fLandmark"),
    city: v("fCity"), state: v("fState"), pincode: v("fPincode"),
    date: v("fDate"), time: v("fTime"), notes: v("fNotes"),
    status: "Pending", paymentStatus: "Payment Pending",
    photoUrls: [], videoUrl: "",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
}

/* ============ Validation ============ */
function setFieldError(input, msg) {
  const field = input.closest(".field");
  if (!field) return;
  field.classList.toggle("invalid", !!msg);
  const err = field.querySelector(".err");
  if (err) err.textContent = msg;
}

function validate(form) {
  let ok = true;
  const mobileRe = /^[6-9]\d{9}$/;
  const pinRe = /^\d{6}$/;
  const gstRe = /^[0-9]{2}[A-Z0-9]{13}$/;

  form.querySelectorAll("[required]").forEach((input) => {
    if (!input.value.trim()) { setFieldError(input, Lang.t("err_required")); ok = false; }
    else setFieldError(input, "");
  });

  const mob = document.getElementById("fMobile");
  if (mob.value && !mobileRe.test(mob.value)) { setFieldError(mob, Lang.t("err_mobile")); ok = false; }
  const alt = document.getElementById("fAlt");
  if (alt.value && !mobileRe.test(alt.value)) { setFieldError(alt, Lang.t("err_mobile")); ok = false; }
  const pin = document.getElementById("fPincode");
  if (pin.value && !pinRe.test(pin.value)) { setFieldError(pin, Lang.t("err_pincode")); ok = false; }
  const gst = document.getElementById("fGst");
  if (gst.value && !gstRe.test(gst.value.toUpperCase())) { setFieldError(gst, "Enter a valid 15-character GST number."); ok = false; }

  /* Hard rule: minimum 1 quintal */
  const weight = document.getElementById("fWeight");
  const w = parseFloat(weight.value);
  if (!isNaN(w) && w < SL.MIN_WEIGHT_KG) {
    setFieldError(weight, Lang.t("err_weight_min"));
    weight.scrollIntoView({ behavior: "smooth", block: "center" });
    ok = false;
  }
  if (!ok) {
    const first = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
    first?.focus({ preventScroll: false });
  }
  return ok;
}
