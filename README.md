# Ethiopian Foreign Employment Recruitment SaaS Platform

Comprehensive multi-tenant SaaS recruitment platform connecting accredited Ethiopian manpower agencies with Gulf employers & jobseekers.

---

## 📁 Repository Folder Structure

```
Maid-App/
├── backend/            # Express REST API, JWT auth, S3 uploads, Chat, Pipelines & Payments
│   └── database/       # PostgreSQL migration and seed SQL scripts
├── frontend/           # Expo SDK 54 React Native Mobile App
│   ├── app/            # Expo Router file-based navigation screens
│   │   ├── (tabs)/     # Bottom tab navigator (Home, Candidates, Jobs, Agencies)
│   │   ├── (auth)/     # Login & Register screens
│   │   ├── (user)/     # User/Employer dashboard
│   │   └── (admin)/    # Agency Admin SaaS dashboard
│   ├── services/       # Axios API service layer with SecureStore JWT
│   ├── context/        # AuthContext & ChatContext providers
│   └── assets/         # App icons and images
├── Documentation.md    # Full technical & architectural specification
└── README.md           # Quickstart guide
```

---

## 🚀 Quickstart Commands (PowerShell)

> **Note for Windows PowerShell**: Use `;` to chain commands (not `&&`).

### 1. Start Backend API Server
```powershell
cd backend; npm start
```
- Runs Express server at `http://localhost:5000`

### 2. Start Mobile App (Expo)
```powershell
cd frontend; npx expo start
```
- Scan the QR code with **Expo Go** on your phone
- Or press `a` for Android emulator / `i` for iOS simulator

### 3. Configure API URL
Edit `frontend/services/api.ts` and set `API_BASE_URL` to your computer's local IP:
```typescript
const API_BASE_URL = 'http://YOUR_IP:5000/api';
```

---

## 🛠️ Stack Overview
- **Backend**: Node.js, Express, PostgreSQL, JWT, Multer, AWS S3 SDK, Firebase Admin (FCM)
- **Mobile App**: Expo SDK 54, React Native, Expo Router, NativeWind (Tailwind CSS), Lucide Icons, Axios, SecureStore
