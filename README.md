# Ethiopian Foreign Employment Recruitment SaaS Platform

Comprehensive multi-tenant SaaS recruitment platform connecting accredited Ethiopian manpower agencies with Gulf employers & jobseekers.

---

## 📁 Repository Folder Structure

```
Maid-App/
├── backend/            # Express REST API, JWT auth, S3 uploads, Chat, Pipelines & Payments
│   └── database/       # PostgreSQL migration and seed SQL scripts
├── frontend/           # React + Vite + Tailwind CSS single page web application
├── Documentation.md    # Full technical & architectural specification document
└── README.md           # Quickstart and overview guide
```

---

## 🚀 Quickstart Commands (PowerShell)

> **Note for Windows PowerShell**: Use `;` to chain commands (do not use `&&`).

### 1. Start Backend API Server
```powershell
cd backend; npm start
```
- Runs Express server at `http://localhost:5000`

### 2. Start Frontend Web Application
```powershell
cd frontend; npm run dev
```
- Runs Vite dev server at `http://localhost:3000`

### 3. Run Backend Integration Test Suites (Phases 1–7)
```powershell
cd backend; node scripts/test-phase1.js
cd backend; node scripts/test-phase2.js
cd backend; node scripts/test-phase3.js
cd backend; node scripts/test-phase4.js
cd backend; node scripts/test-phase5.js
cd backend; node scripts/test-phase6.js
cd backend; node scripts/test-phase7.js
```

---

## 🛠️ Stack Overview
- **Backend**: Node.js, Express, PostgreSQL, JWT, Multer, AWS S3 SDK, Firebase Admin (FCM).
- **Frontend**: React 18, Vite, Tailwind CSS (Ethiopian Gold `#D4AF37` & Navy `#0A192F`), Lucide Icons, Axios, React Router DOM.
