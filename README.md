# Company Vehicle Management (Local Development)

A full‑stack demo for managing company vehicles and reservations — set up for **local development only**. The app lets **drivers** register/login, upload a driver’s license, browse/search vehicles, make/cancel reservations, and report issues. **Admins** can add/delete vehicles, mark repairs complete, and view all current reservations.

**Tech stack:** React (CRA) · Firebase Auth & Firestore · **Express server (Node 18)** · Cloudinary (image upload) · Jest/RTL for tests.

> Note: The previous `/api` base path has been **removed**. All backend routes are now rooted at **`/server`**.

---

## Features

- Email/password **auth** (Firebase).
- **Profile** view with role (default `Driver`) and license image.
- **Driver’s license upload** → stored on Cloudinary, URL saved in Firestore.
- **Vehicle catalog** with search (name, color, engine, year range, HP range).
- **Reserve / unreserve** a vehicle (date picker, status prevents double bookings).
- **Report issue** → vehicle moves to `repair`, active reservations removed.
- **Admin**: add vehicle, delete vehicle, **finish repair** (set back to `available`), view **current reservations** with user+vehicle info and license thumbnail.
- **CORS** enabled for local dev.
- **Frontend tests** for key UI flows (Jest + React Testing Library).

---

## Monorepo Layout

```
/server/                   # Express API (Node.js)
  lib/
    cloudinary.js          # Cloudinary init (v2)
    firebaseAdmin.js       # Firebase Admin (Service Account)
    verifyAuth.js          # Bearer -> ID token verification + role lookup
  routes/
    auth.js                # /server/auth/*  (profile, upload-license)
    vehicle.js             # /server/vehicle/* (vehicles, reserve, repair, etc.)
    reservation.js         # /server/reservation/* (list/get/delete)
  server.js                # Express app entry

/frontend/                 # React app (Create React App)
  src/components/          # UI components (Register, Login, Profile, etc.)
  src/services/            # Fetch wrappers to the API
  src/firebaseClient.js    # Firebase client init (Auth + Firestore)
  src/firebaseConfig.js    # Client config (public)
  src/__tests__/           # RTL tests
  public/                  # CRA public assets

package.json               # Root scripts (dev server + CRA + tests)
firebase.json              # Optional: SPA hosting (not used for API locally)
firestore.rules            # Firestore security rules (client-side access)
```

---

## Quick Start (Local)

**Prerequisites:** Node ≥ 18, npm, a Cloudinary account, and a Firebase project (Auth + Firestore).

### 1) Install dependencies

```bash
# from repo root
npm install
npm --prefix frontend install
```

### 2) Environment variables

Create a **`.env` in the project root** for the Express server (used by `/server/*` routes):

```bash
# Firebase Admin (Service Account)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
"
FIREBASE_CLIENT_EMAIL=your-sa@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=1234567890
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

# Cloudinary (for license uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=4000
```

> The **private key must keep `\n` escape sequences** inside the env var. The server replaces them with real newlines at runtime.

Create **`frontend/.env`** to let the React app talk to the Express server at `/server`:

```bash
# Frontend -> API base (relative; CRA dev server proxies to 4000 via package.json)
REACT_APP_API_URL=/server
```

Notes:
- `frontend/package.json` already proxies unknown requests to `http://localhost:4000` during development.
- If you prefer an absolute base URL instead, you can set `REACT_APP_API_URL=http://localhost:4000/server`.

### 3) Run in development

```bash
# One command for both servers (Express @ 4000 + CRA @ 3000)
npm run dev
```

Open the app at **http://localhost:3000**. The Express server logs: `Server listening on http://localhost:4000`.

> If you see `'react-scripts' is not recognized` install frontend deps: `npm --prefix frontend install`.

### 4) Build (optional)

```bash
# Build the CRA app only (output in frontend/build)
npm run build:frontend
```

### 5) Tests

```bash
# Frontend tests (Jest + RTL)
npm test
```

---

## Auth, Roles & Security

- **Auth:** All backend routes require `Authorization: Bearer <Firebase ID token>`. Tokens are verified in `server/lib/verifyAuth.js`.
- **Role source:** Firestore `users/{uid}.role` (defaults to `Driver` when missing).
- **Roles in backend:**
  - `Admin`: can `POST /server/vehicle/vehicles`, `DELETE /server/vehicle/vehicles/:id`, `GET /server/vehicle/admin-reservations`.
  - `Driver`: reserve/unreserve and report issues.
  - `Manager`: currently **UI-only**; the `admin-reservations` API is restricted to Admin in code.
- **Firestore rules (client):** only `users/{uid}` is readable/writable by the signed-in user; other collections are server-managed via Admin SDK (`firestore.rules`).

---

## Data Model (Firestore)

- **users/{uid}**
  - `email`, `role`, `licenseImageUrl`

- **vehicles/{vehicleId}**
  - `vehicleId`, `vehicleName`, `engine`, `hp`, `color`, `year`, `status`
  - `status`: `"available"` · `"repair"` · `"<reservationId>"` (reserved)

- **reservation/{reservationId}**
  - `reservationId`, `vehicleId`, `userId`, `startDate`, `endDate`, `status`

- **malfunctions/{autoId}**
  - `vehicleId`, `userId`, `description`, `status`, `createdAt`

---

## REST API (Local)

> **Base URL:** `REACT_APP_API_URL` (defaults to `/server` in development).  
> All routes require `Authorization: Bearer <ID_TOKEN>`.

### Health
- `GET /server/health` → `{ status: "ok", message, timestamp }`

### Auth
- `GET /server/auth/profile` → `{ email, role, licenseImageUrl }`
- `POST /server/auth/upload-license` (multipart form, field **`licenseImage`**)
  - Uploads to Cloudinary `licenses/{uid}` and updates `users/{uid}.licenseImageUrl`

**cURL example:**
```bash
TOKEN="your_firebase_id_token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/server/auth/profile
```

```bash
curl -X POST   -H "Authorization: Bearer $TOKEN"   -F "licenseImage=@/path/to/license.png"   http://localhost:4000/server/auth/upload-license
```

### Vehicles
- `GET /server/vehicle/vehicles` → list all vehicles
- `GET /server/vehicle/vehicles/:vehicleId` → one vehicle
- `POST /server/vehicle/vehicles` (Admin) body: `{ vehicleName, engine, hp, color, year }`
- `DELETE /server/vehicle/vehicles/:vehicleId` (Admin)
- `PATCH /server/vehicle/vehicles/:vehicleId/reserve` body: `{ startDate, endDate }`
  - Creates a reservation doc and sets vehicle `status` to the created `reservationId`.
- `PATCH /server/vehicle/vehicles/:vehicleId/unreserve`
  - Sets `status: "available"` (client is expected to delete the reservation doc).
- `PATCH /server/vehicle/vehicles/:vehicleId/repair` (Admin)
  - **Finishes** a repair: only allowed when current `status === "repair"`; sets `available` and deletes malfunctions for the vehicle.
- `POST /server/vehicle/vehicles/:vehicleId/report-issue` body: `{ description }`
  - Writes a `malfunctions` doc, sets vehicle to `"repair"`, deletes **Active** reservations for that vehicle.
- `GET /server/vehicle/malfunctions` → list malfunctions
- `GET /server/vehicle/admin-reservations` (Admin)
  - Aggregates reservation + vehicle + user (email & license thumbnail).

**cURL reserve example:**
```bash
curl -X PATCH   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -d '{"startDate":"2025-01-01","endDate":"2025-01-03"}'   http://localhost:4000/server/vehicle/vehicles/veh1/reserve
```

### Reservations
- `GET /server/reservation/reservation` → list all reservations
- `GET /server/reservation/reservation/:resId` → one reservation
- `DELETE /server/reservation/reservation/:resId`
  - Deletes by **reservationId** (query), not document id. Useful when vehicle `status` holds the `reservationId`.

---

## Frontend (CRA)

Key screens/components:
- **Login / Register** – sets ID token to app state.
- **Profile** – shows email, role, license image + upload form.
- **UploadLicense** – used immediately post-registration or from the dashboard.
- **ReserveVehicle** – vehicle table + search + actions.
- **ReserveVehicleForm** – date picker flow; calls API to reserve.
- **ViewReservation** – shows current reservation; remove reservation; report issue.
- **AddVehicle** (Admin)
- **CurrentReservationsAdmin** (Admin)

> The base URL for fetches comes from `src/config.js` (reads `REACT_APP_API_URL`). For local dev, set it to `/server` via `frontend/.env`.

---

## CORS

The Express app enables CORS for local development via `cors()`. Since auth uses **Bearer tokens** (no cookies), this is acceptable for local testing.

---

## Troubleshooting

- **`react-scripts` not recognized:** Run `npm --prefix frontend install`.
- **Port already in use:** 3000 (CRA) or 4000 (server). Free the port or change it (`PORT=...`). On Windows PowerShell:
  ```powershell
  # find
  netstat -ano | findstr :3000
  # kill (replace PID)
  taskkill /PID <PID> /F
  ```
- **401/403 Unauthorized:** Missing/expired Firebase ID token; ensure `Authorization: Bearer <ID_TOKEN>` header.
- **License upload fails:** Check Cloudinary envs; the server logs a warning if missing.
- **`FIREBASE_PRIVATE_KEY` format:** Must include `\n` escapes inside the env var.
- **Non‑JSON response errors:** Frontend guards for this and reports the raw response head.

---

## Admin Tips

- Promote a user to **Admin** by setting `users/{uid}.role = "Admin"` in Firestore.
- **Manager** is currently a UI-only role; backend endpoints requiring elevated access are restricted to **Admin**.
