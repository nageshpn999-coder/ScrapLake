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

/* ============ Image compression ============ */
function compressImage(file, maxDim = 1600, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("compress failed"))),
        "image/jpeg", quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
    img.src = url;
  });
}

/* ============ Form ============ */
function initForm() {
  const form = document.getElementById("pickupForm");
  if (!form) return;

  let photoFiles = []; /* compressed blobs with preview URLs */
  let videoFile = null;

  const photosInput = document.getElementById("fPhotos");
  const thumbs = document.getElementById("photoThumbs");

  photosInput.addEventListener("change", async () => {
    const files = Array.from(photosInput.files || []);
    for (const f of files) {
      if (photoFiles.length >= SL.MAX_PHOTOS) {
        setFieldError(photosInput, Lang.t("err_photos_max"));
        break;
      }
      try {
        const blob = await compressImage(f);
        photoFiles.push({ blob, url: URL.createObjectURL(blob), name: f.name });
        setFieldError(photosInput, "");
      } catch { /* skip unreadable file */ }
    }
    photosInput.value = "";
    renderThumbs();
  });

  function renderThumbs() {
    thumbs.innerHTML = photoFiles.map((p, i) => `
      <div class="thumb"><img src="${p.url}" alt="Photo ${i + 1}" />
      <button type="button" data-i="${i}" aria-label="Remove photo">✕</button></div>`).join("");
  }
  thumbs.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    URL.revokeObjectURL(photoFiles[btn.dataset.i].url);
    photoFiles.splice(btn.dataset.i, 1);
    renderThumbs();
  });

  document.getElementById("fVideo").addEventListener("change", (e) => {
    videoFile = e.target.files[0] || null;
    document.getElementById("videoName").textContent = videoFile ? `🎬 ${videoFile.name}` : "";
  });

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
      if (FIREBASE_READY) {
        data.photoUrls = await uploadAll(requestId, photoFiles, videoFile, data);
        await db.collection("requests").doc(requestId).set(data);
      } else {
        /* Demo mode: persist locally so the flow is testable before Firebase setup */
        const all = JSON.parse(localStorage.getItem("sl_demo_requests") || "[]");
        all.unshift({ ...data, createdAt: Date.now() });
        localStorage.setItem("sl_demo_requests", JSON.stringify(all));
        await new Promise((r) => setTimeout(r, 600));
      }
      form.hidden = true;
      const box = document.getElementById("successBox");
      document.getElementById("successMsg").textContent =
        Lang.t("success_body").replace("{id}", requestId);
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

  async function uploadAll(requestId, photos, video, data) {
    const progress = document.getElementById("uploadProgress");
    const bar = document.getElementById("uploadBar");
    const pct = document.getElementById("uploadPct");
    progress.hidden = false;

    const total = photos.length + (video ? 1 : 0);
    let done = 0;
    const tick = () => {
      const p = total ? Math.round((++done / total) * 100) : 100;
      bar.style.setProperty("--w", p + "%");
      pct.textContent = p + "%";
    };

    const urls = [];
    for (let i = 0; i < photos.length; i++) {
      const ref = storage.ref(`requests/${requestId}/photo-${i + 1}.jpg`);
      await ref.put(photos[i].blob, { contentType: "image/jpeg" });
      urls.push(await ref.getDownloadURL());
      tick();
    }
    if (video) {
      const ref = storage.ref(`requests/${requestId}/video-${video.name}`);
      await ref.put(video);
      data.videoUrl = await ref.getDownloadURL();
      tick();
    }
    progress.hidden = true;
    return urls;
  }
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
    createdAt: FIREBASE_READY ? firebase.firestore.FieldValue.serverTimestamp() : Date.now(),
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
