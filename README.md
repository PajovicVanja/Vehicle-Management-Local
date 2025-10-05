
# Company Vehicle Management

A full‑stack demo for managing company vehicles and reservations. The app lets **drivers** register/login, upload a driver’s license, browse/search vehicles, make/cancel reservations, and report issues. **Admins** can add/delete vehicles, mark repairs complete, and view all current reservations.  

**Tech stack:** React (CRA) • Firebase Auth & Firestore • Vercel Serverless APIs (Node 18) • Cloudinary (image upload) • Jest/RTL for tests.



---

##  Features
- Email/password **auth** (Firebase).
- **Profile** view with role (default `Driver`) and license image.
- **Driver’s license upload** → stored on Cloudinary, URL saved in Firestore.
- **Vehicle catalog** with search (name, color, engine, year range, HP range).
- **Reserve / unreserve** a vehicle (date picker, protects from double booking by status).
- **Report issue** → vehicle moves to `repair`, active reservations removed.
- **Admin**: add vehicle, delete vehicle, **finish repair** (set back to `available`), view **current reservations** with user+vehicle info and license thumbnail.
- **CORS** allowlist for your deployed origins.
- **Tests** for APIs and key UI flows.

---

##  Monorepo Layout

```
/api/                     # Vercel serverless functions (Node.js)
  _lib/                   # Shared helpers (Firebase Admin, CORS, auth, Cloudinary)
  auth/[...path].js       # /api/auth/* (profile, upload-license)
  vehicle/[...path].js    # /api/vehicle/* (vehicles, reserve, repair, etc.)
  reservation/[...path].js# /api/reservation/* (list/get/delete)
  health.js               # /api/health
  __tests__/              # Jest tests for API with in‑memory Firestore mock

/frontend/                # React app (CRA)
  src/components/         # UI components (Register, Login, Profile, etc.)
  src/services/           # Fetch wrappers to the API
  src/firebaseClient.js   # Firebase client init (Auth + Firestore)
  src/firebaseConfig.js   # Client config (public)
  src/__tests__/          # RTL tests
  public/                 # CRA public assets

package.json              # Root (API deps + test scripts + static build hook)
vercel.json               # Build + routes for API and SPA on Vercel
firebase.json             # Optional Firebase Hosting for the SPA
firestore.rules           # Firestore security rules (client-side access)
```

---

##  Quick Start (Local)

**Prereqs:** Node ≥ 18, npm (or yarn), Cloudinary account, Firebase project.

1) **Install** (root + frontend):
```bash
npm install
npm --prefix frontend install
```

2) **Environment variables** (for API functions):
Create envs in your shell or in Vercel dashboard. Required by `/api/_lib/firebaseAdmin.js` and `/api/_lib/cloudinary.js`:

```bash
# Firebase Admin (Service Account) – store as Vercel env vars
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=...

# Cloudinary (for license uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Frontend → API base; omit to default to "/api"
# In CRA: create frontend/.env with REACT_APP_API_URL=http://localhost:3001/api if needed
REACT_APP_API_URL=http://localhost:3001/api
```

>  The **private key must keep `\n`** newlines escaped when set in envs (Vercel/CLI).  
> Client `firebaseConfig.js` contains public config (safe to ship). Do **not** put secrets in frontend code.

3) **Run locally**

**Option A — one process via Vercel dev (recommended for API):**
```bash
# run on a non-CRA port to avoid clash
npx vercel dev --listen 3001
# Frontend fetches /api from http://localhost:3001 → set REACT_APP_API_URL accordingly
```

**Option B — separate processes:**
```bash
# 1) Start API via Vercel dev on 3001
npx vercel dev --listen 3001

# 2) Start CRA at 3000
npm --prefix frontend start

# 3) Point the frontend to the API:
# frontend/.env → REACT_APP_API_URL=http://localhost:3001/api
```

4) **Build**:
```bash
# Builds the CRA app from root using the configured static-build
npm run build:frontend
```

5) **Tests**:
```bash
# API + Frontend
npm test

# Only API
npm run test:api

# Only Frontend
npm run test:frontend
```

---

##  Auth, Roles & Security

- **Auth:** Bearer token from Firebase ID token. Verified in all API routes by `verifyAuth()` (Admin SDK).
- **Role source:** Firestore `users/{uid}.role` (falls back to `Driver` when missing).
- **Roles in backend:**
  - `Admin`: can `POST /vehicle/vehicles`, `DELETE /vehicle/vehicles/:id`, `GET /vehicle/admin-reservations`.
  - `Driver`: reserve/unreserve and report issues.
  - `Manager`: currently **UI-only**; the `admin-reservations` API is restricted to Admin in code.
- **Firestore rules (client):** only `users/{uid}` is readable/writable by the signed-in user; other collections are server-managed via Admin SDK (`firestore.rules`).

---

##  CORS

Allowlist covers your Firebase Hosting + localhost + Vercel previews. Others fall back to `*` since Bearer tokens are used (no cookies). See `api/_lib/cors.js` to adjust.

---

##  Data Model (Firestore)

- **users/{uid}**
  - `email`, `role`, `licenseImageUrl`

- **vehicles/{vehicleId}**
  - `vehicleId`, `vehicleName`, `engine`, `hp`, `color`, `year`, `status`
  - `status`: `"available"` | `"repair"` | `"<reservationId>"` (reserved)

- **reservation/{reservationId}**
  - `reservationId`, `vehicleId`, `userId`, `startDate`, `endDate`, `status`

- **malfunctions/{autoId}**
  - `vehicleId`, `userId`, `description`, `status`, `createdAt`

---

##  REST API

> Base URL: `REACT_APP_API_URL` (defaults to `/api` in the frontend). All routes require `Authorization: Bearer <ID_TOKEN>`.

### Health
- `GET /api/health` → `{ status: "ok", message, timestamp }`

### Auth
- `GET /api/auth/profile` → `{ email, role, licenseImageUrl }`
- `POST /api/auth/upload-license` (multipart form, field **`licenseImage`**)
  - Uploads to Cloudinary `licenses/{uid}` and updates `users/{uid}.licenseImageUrl`

**cURL example:**
```bash
curl -H "Authorization: Bearer $TOKEN"   http://localhost:3001/api/auth/profile
```

```bash
curl -X POST -H "Authorization: Bearer $TOKEN"   -F "licenseImage=@/path/to/license.png"   http://localhost:3001/api/auth/upload-license
```

### Vehicles
- `GET /api/vehicle/vehicles` → list all vehicles
- `GET /api/vehicle/vehicles/:vehicleId` → one vehicle
- `POST /api/vehicle/vehicles` (Admin) body: `{ vehicleName, engine, hp, color, year }`
- `DELETE /api/vehicle/vehicles/:vehicleId` (Admin)
- `PATCH /api/vehicle/vehicles/:vehicleId/reserve` body: `{ startDate, endDate }`
  - Creates a reservation doc, sets vehicle `status` to the created `reservationId`.
- `PATCH /api/vehicle/vehicles/:vehicleId/unreserve`
  - Sets `status: "available"` (client is expected to delete the reservation doc).
- `PATCH /api/vehicle/vehicles/:vehicleId/repair` (Admin)
  - **Finishes** a repair: only allowed when current `status === "repair"`; sets `available` and deletes malfunctions for the vehicle.
- `POST /api/vehicle/vehicles/:vehicleId/report-issue` body: `{ description }`
  - Writes a `malfunctions` doc, sets vehicle to `"repair"`, deletes **Active** reservations for that vehicle.
- `GET /api/vehicle/malfunctions` → list malfunctions
- `GET /api/vehicle/admin-reservations` (Admin)
  - Aggregates reservation + vehicle + user (email & license thumbnail).

**cURL reserve example:**
```bash
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"   -d '{"startDate":"2025-01-01","endDate":"2025-01-03"}'   http://localhost:3001/api/vehicle/vehicles/veh1/reserve
```

### Reservations
- `GET /api/reservation/reservation` → list all reservations
- `GET /api/reservation/reservation/:resId` → one reservation
- `DELETE /api/reservation/reservation/:resId`
  - Deletes by **reservationId** (query), not document id. Useful when status on the vehicle holds the reservationId.

---

##  Frontend (CRA)

Key screens/components:
- **Login / Register** (`Login.js`, `Register.js`) – sets ID token to app state.
- **Profile** (`Profile.js`) – shows email, role, license image + upload form.
- **UploadLicense** – also used immediately post-registration.
- **ReserveVehicle** – vehicle table + rich search + actions.
- **ReserveVehicleForm** – date picker flow; calls API to reserve.
- **ViewReservation** – shows current reservation; remove reservation; report issue.
- **AddVehicle** (Admin) – adds vehicle.
- **CurrentReservationsAdmin** (Admin) – table with aggregated data.

> Base URL for fetches comes from `src/config.js` (`REACT_APP_API_URL` or `/api`).

---

## 🧪 Testing

- **API tests:** under `api/__tests__` using `node-mocks-http` and a small **in‑memory Firestore mock**.
- **Frontend tests:** React Testing Library under `frontend/src/__tests__`.

Run:
```bash
npm test             # everything
npm run test:api     # API only
npm run test:frontend# frontend only
```

---

##  Deployment (Vercel + optional Firebase Hosting)

- **Vercel** uses `vercel.json`:
  - Builds serverless functions from `/api/**` (`@vercel/node`).
  - Builds SPA from `frontend/build` (`@vercel/static-build`).
  - Routes `/api/*` to the corresponding handlers.
- Set all Firebase Admin + Cloudinary env vars in the Vercel project.
- Optionally, deploy the SPA to **Firebase Hosting** using `firebase.json`. (If you do, keep APIs on Vercel or port APIs elsewhere.)

Build step:
```bash
# Vercel's build runs this by default:
npm run vercel-build
```

---

##  Troubleshooting

- **401 / 403 Unauthorized**: Missing/expired Firebase ID token; ensure `Authorization: Bearer <ID_TOKEN>` header.
- **License upload fails**: Check Cloudinary envs; the API logs a warning if missing.
- **`FIREBASE_PRIVATE_KEY` format**: Must include `\n` escapes in env var. The code replaces them with real newlines.
- **Non‑JSON response errors**: Frontend guards for this and reports the raw response head.
- **“Repair” endpoint**: It **finishes** a repair (only works if vehicle is already `"repair"`). Use **report‑issue** to move a vehicle into `"repair"`.

---

##  Admin Tips

- Promote a user to **Admin** by setting `users/{uid}.role = "Admin"` in Firestore.
- Manager is currently **UI‑level** only; APIs require Admin for global reservation views.



