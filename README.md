# ScrapLake — Sell Your Scrap with Ease

A mobile-first online scrap pickup platform. Customers submit pickup requests with photos, get a quote, and schedule free doorstep pickup. Admins manage requests from a secure dashboard.

## Folder structure

```
scraplake/
├── index.html          Home page + booking form (SEO, OG, schema markup)
├── track.html          Customer pickup tracking (by request ID or mobile)
├── admin.html          Secure admin dashboard
├── css/
│   └── styles.css      Design system (mobile-first, animations, print styles)
├── js/
│   ├── firebase-config.js   Firebase init + shared constants  ← edit this
│   ├── i18n.js              English / Telugu translations
│   ├── app.js               Home: rates, categories, validation, image compression, upload
│   ├── admin.js             Admin: auth, stats, filters, status updates, CSV export, print/PDF
│   └── track.js             Tracking timeline
├── firestore.rules     Firestore security rules (public create, admin-only manage)
├── storage.rules       Storage rules (image/video only, 25 MB cap)
├── firebase.json       Hosting + rules deployment config
├── robots.txt / sitemap.xml
└── README.md
```

## Features

- **Booking form** with full validation: 10-digit Indian mobile, 6-digit pincode, GST format, and the hard rule — **minimum 1 quintal (100 KG)**; submission is blocked below 100 KG with the required message.
- **Up to 15 photos** — compressed client-side (canvas → JPEG, max 1600 px) before upload — plus optional video.
- **Google Maps location** via a paste-a-link field or one-tap "Use my location" (geolocation → maps URL).
- **Live scrap rates** board + scrolling ticker (edit the `RATES` array in `js/app.js`, or wire it to a Firestore `rates` collection).
- **English / Telugu** toggle, persisted in localStorage.
- **Admin dashboard**: email/password login, live stats (Today / Pending / Accepted / Scheduled / Driver Assigned / On The Way / Picked Up / Completed / Cancelled / Payment Pending / Payment Completed), search by name or mobile, filter by status and scrap type, view photos/video/map, call & WhatsApp buttons, edit status, delete, CSV export ("Excel"), print, and per-request PDF (browser print-to-PDF).
- **Customer tracking** page with a visual status timeline.
- **Demo mode**: until you paste your Firebase config, submissions are stored in localStorage so you can test the whole flow locally.
- **SEO**: meta tags, Open Graph, LocalBusiness schema, robots.txt, sitemap.xml, fast static loading.

## 1 · Firebase setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (e.g. `scraplake`).
2. **Build → Authentication → Sign-in method** → enable **Email/Password**. Then **Users → Add user** to create your admin account.
3. **Build → Firestore Database** → Create database (production mode).
4. **Build → Storage** → Get started.
5. **Project settings → General → Your apps → Web (</>)** → register the app and copy the config object into `js/firebase-config.js`, replacing the `YOUR_…` placeholders.
6. **Grant admin access**: in Firestore, create a collection `admins` and add a document whose **document ID is the admin user's UID** (find the UID under Authentication → Users). Content can be `{ role: "admin" }`.
7. Deploy the security rules (next section) — the app will not be secure with default open rules.

### Deploy rules + hosting with the Firebase CLI

```bash
npm install -g firebase-tools
firebase login
cd scraplake
firebase init            # select Hosting, Firestore, Storage — keep existing files
firebase deploy          # deploys site + firestore.rules + storage.rules
```

Your site is live at `https://YOUR_PROJECT.web.app` (add a custom domain under Hosting → Add custom domain).

> **Firestore index**: the tracking page queries `mobile == X orderBy createdAt`. The first such query logs a console link to create the composite index — click it once.

## 2 · Deploy to GitHub Pages (alternative/additional hosting)

GitHub Pages serves the static files; Firebase still provides the database, storage and auth.

```bash
cd scraplake
git init
git add .
git commit -m "ScrapLake v1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/scraplake.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save.**
Site goes live at `https://YOUR_USERNAME.github.io/scraplake/`.

Finally, authorize the domain in Firebase: **Authentication → Settings → Authorized domains → Add** `YOUR_USERNAME.github.io` (and your custom domain, if any).

## 3 · Notifications & invoices (Cloud Functions — ready to extend)

The data model is Cloud Functions-ready. Typical next steps (Blaze plan required for outbound APIs):

- **WhatsApp/SMS notification on new request or status change**: an `onWrite` trigger on `requests/{id}` calling the WhatsApp Business Cloud API / MSG91 / Twilio.
- **Invoice PDF**: an HTTPS function that renders the request into a PDF and stores it in Storage for customer download.

```bash
firebase init functions   # Node.js, then add triggers in functions/index.js
firebase deploy --only functions
```

## 4 · Customizing

| What | Where |
|---|---|
| Phone / WhatsApp / email | `js/firebase-config.js` (`SL` constants) + links in the HTML |
| Scrap rates | `RATES` array in `js/app.js` |
| Categories & types | `CATEGORIES` / `SCRAP_TYPES` in `js/app.js` |
| Translations | `js/i18n.js` |
| Colors & fonts | `:root` variables in `css/styles.css` |
| Minimum weight | `SL.MIN_WEIGHT_KG` in `js/firebase-config.js` **and** `firestore.rules` (kept in both so the rule is enforced server-side too) |

## Local preview

```bash
cd scraplake
python3 -m http.server 8080   # or: npx serve
# open http://localhost:8080
```

Without Firebase config, the site runs in demo mode (localStorage), so you can test booking, admin and tracking end-to-end before going live.
