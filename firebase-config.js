/* ScrapLake — Firebase configuration */
const firebaseConfig = {
  apiKey: "AIzaSyAHc3d9g0C8CHGeBD_-V8fUC21i7Z0NlD8",
  authDomain: "scraplake.firebaseapp.com",
  projectId: "scraplake",
  storageBucket: "scraplake.firebasestorage.app",
  messagingSenderId: "388340330039",
  appId: "1:388340330039:web:b72de41a5005f7c00319b2",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const FIREBASE_READY = true;

/* Photo upload is OFF (Firebase Storage needs the paid Blaze plan).
   Customers are asked to send photos on WhatsApp instead.
   To turn it on later: upgrade to Blaze, enable Storage, set this to true. */
const PHOTO_UPLOAD_ENABLED = false;

/* Shared constants */
const SL = {
  PHONE_MAIN: "+919515624416",
  PHONE_ALT: "+919553634973",
  WHATSAPP: "919515624416",
  EMAIL: "info@scraplake.in",
  MIN_WEIGHT_KG: 100,
  STATUSES: [
    "Pending", "Accepted", "Pickup Scheduled", "Driver Assigned",
    "On The Way", "Picked Up", "Completed", "Cancelled",
  ],
  PAYMENT_STATUSES: ["Payment Pending", "Payment Completed"],
};

/* Human-readable request ID, e.g. SL-260911-4F2K */
function makeRequestId() {
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SL-${ymd}-${rand}`;
}
