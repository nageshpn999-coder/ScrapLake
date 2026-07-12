/* ScrapLake — Firebase configuration
 *
 * 1. Create a project at https://console.firebase.google.com
 * 2. Enable: Authentication (Email/Password), Cloud Firestore, Storage
 * 3. Project settings → Your apps → Web app → copy the config below
 * 4. Deploy firestore.rules and storage.rules (see README.md)
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

/* Detect placeholder config so the UI can fall back to demo mode gracefully. */
const FIREBASE_READY = !firebaseConfig.apiKey.startsWith("YOUR_");

/* Shared constants */
const SL = {
  PHONE_MAIN: "+919515624416",
  PHONE_ALT: "+919553634973",
  WHATSAPP: "919515624416",
  EMAIL: "info@scraplake.in",
  MIN_WEIGHT_KG: 100,
  MAX_PHOTOS: 15,
  STATUSES: [
    "Pending", "Accepted", "Pickup Scheduled", "Driver Assigned",
    "On The Way", "Picked Up", "Completed", "Cancelled",
  ],
  PAYMENT_STATUSES: ["Payment Pending", "Payment Completed"],
};

/* Human-readable request ID, e.g. SL-260709-4F2K */
function makeRequestId() {
  const d = new Date();
  const ymd = d.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SL-${ymd}-${rand}`;
}
