# Ethiopian Recruitment Agency App — Full Build Documentation

**Version:** 1.0  
**Stack:** React Native · Node.js + Express · PostgreSQL · AWS S3 · Firebase · Africa's Talking  
**Model:** Multi-tenant SaaS — one mobile app, multiple agency workspaces

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack & Versions](#3-tech-stack--versions)
4. [Folder Structure](#4-folder-structure)
5. [Environment Variables](#5-environment-variables)
6. [Database Setup & Migrations](#6-database-setup--migrations)
7. [Authentication System](#7-authentication-system)
8. [API Reference](#8-api-reference)
9. [File Storage — AWS S3 + CloudFront](#9-file-storage--aws-s3--cloudfront)
10. [Push Notifications — Firebase](#10-push-notifications--firebase)
11. [SMS — Africa's Talking](#11-sms--africas-talking)
12. [Multi-tenancy Model](#12-multi-tenancy-model)
13. [Admin Panel — Features & Flows](#13-admin-panel--features--flows)
14. [User App — Screens & Flows](#14-user-app--screens--flows)
15. [Hiring Pipeline Logic](#15-hiring-pipeline-logic)
16. [Security Considerations](#16-security-considerations)
17. [Screen Inventory](#17-screen-inventory)
18. [Deployment Guide](#18-deployment-guide)
19. [Build Order (What to Build First)](#19-build-order)

---

## 1. Project Overview

### What This App Does

A single React Native mobile application (iOS + Android) that connects **Ethiopian recruitment agencies** with **Middle Eastern employers** and **Ethiopian job seekers**. The platform is built around a licensed recruitment agency as the anchor customer, with a subscription model for additional agencies.

### The Two User Types

| User Type | Login | Access |
|---|---|---|
| **Regular User** | Phone + password (OTP verified) | Browse candidates (employer mode) or browse vacancies (job seeker mode). Same account, switchable modes. |
| **Admin User** | Email + password | Full agency dashboard. Post candidates, post vacancies, manage pipeline, handle inquiries and applications. |

### The Two Core Flows

**Employer Flow:** Admin uploads candidate profile → Employer browses candidates → Employer contacts agency via WhatsApp/Telegram/IMO/phone/in-app → Agency manages the hiring.

**Job Seeker Flow:** Admin posts verified job vacancy → Job seeker browses vacancies → Job seeker contacts agency or applies in-app → Agency manages the application.

The agency is always the middle point. No direct contact between employers and candidates. No direct contact between job seekers and employers. Everything routes through the agency.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│               React Native Mobile App               │
│         (iOS + Android — single codebase)           │
│                                                     │
│  ┌──────────────┐         ┌─────────────────────┐  │
│  │  User App    │         │    Admin Panel       │  │
│  │  (2 modes)   │         │  (Agency Dashboard)  │  │
│  └──────────────┘         └─────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / JWT
                       ▼
┌─────────────────────────────────────────────────────┐
│              Node.js + Express API Server           │
│                                                     │
│  Auth Middleware → Route Handlers → Controllers     │
│  Multi-tenancy Middleware (agency_id injection)     │
└──────┬──────────┬──────────┬────────────┬───────────┘
       │          │          │            │
       ▼          ▼          ▼            ▼
┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│PostgreSQL│ │AWS S3  │ │Firebase│ │Africa's  │
│(primary  │ │+Cloud- │ │(Push   │ │Talking   │
│database) │ │Front   │ │Notifs) │ │(SMS)     │
└──────────┘ └────────┘ └────────┘ └──────────┘
```

### Request Flow

1. Mobile app sends request with `Authorization: Bearer <JWT>`
2. Auth middleware verifies token, extracts `userId` or `adminId` + `role`
3. Multi-tenancy middleware resolves `agency_id` from token or URL context
4. Controller runs business logic against PostgreSQL
5. For file uploads: files go to S3 via pre-signed URL; only the URL is stored in the DB
6. For notifications: notification service calls Firebase (push) and/or Africa's Talking (SMS) after the primary DB write

---

## 3. Tech Stack & Versions

### Mobile (React Native)

| Package | Version | Purpose |
|---|---|---|
| `react-native` | 0.73+ | Core framework |
| `@react-navigation/native` | 6.x | Navigation |
| `@react-navigation/stack` | 6.x | Stack navigator |
| `@react-navigation/bottom-tabs` | 6.x | Tab navigator |
| `zustand` | 4.x | State management (lightweight, no boilerplate) |
| `axios` | 1.x | HTTP client |
| `@react-native-async-storage/async-storage` | 1.x | Token storage |
| `react-native-video` | 5.x | Candidate intro video playback |
| `react-native-image-picker` | 7.x | Photo/video upload |
| `react-native-document-picker` | 9.x | Document upload |
| `@notifee/react-native` | 7.x | Local notification display |
| `@react-native-firebase/app` | 18.x | Firebase core |
| `@react-native-firebase/messaging` | 18.x | FCM push notifications |
| `react-native-linking` | built-in | WhatsApp/Telegram/IMO deep links |
| `react-native-flash-message` | 0.x | Toast notifications |
| `react-native-skeleton-placeholder` | 5.x | Loading skeletons |
| `@shopify/flash-list` | 1.x | High-performance candidate/vacancy lists |
| `react-native-fast-image` | 8.x | Cached candidate photo display |
| `react-hook-form` | 7.x | Form management |
| `zod` | 3.x | Schema validation |

### Backend (Node.js)

| Package | Version | Purpose |
|---|---|---|
| `express` | 4.x | HTTP server framework |
| `pg` | 8.x | PostgreSQL client |
| `jsonwebtoken` | 9.x | JWT creation and verification |
| `bcryptjs` | 2.x | Password hashing |
| `multer` | 1.x | Multipart file handling |
| `@aws-sdk/client-s3` | 3.x | AWS S3 uploads |
| `@aws-sdk/s3-request-presigner` | 3.x | Pre-signed URL generation |
| `firebase-admin` | 12.x | Firebase push notification dispatch |
| `africastalking` | 0.x | Africa's Talking SMS |
| `express-rate-limit` | 7.x | Rate limiting |
| `helmet` | 7.x | HTTP security headers |
| `cors` | 2.x | CORS headers |
| `express-validator` | 7.x | Request validation |
| `dotenv` | 16.x | Environment variable loading |
| `winston` | 3.x | Logging |
| `node-cron` | 3.x | Cron jobs (expire vacancies, etc.) |
| `uuid` | 9.x | UUID generation |
| `nodemailer` | 6.x | Email sending (optional) |

### Infrastructure

| Service | Purpose |
|---|---|
| **PostgreSQL 16** | Primary database |
| **AWS S3** | Candidate photos, intro videos, documents |
| **AWS CloudFront** | CDN for fast media delivery |
| **Firebase Cloud Messaging** | Push notifications to mobile |
| **Africa's Talking** | SMS for Ethiopian users |
| **Redis** (optional, recommended) | OTP caching, rate limiting, session store |

---

## 4. Folder Structure

### Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                  # PostgreSQL pool setup
│   │   ├── s3.js                  # AWS S3 client config
│   │   ├── firebase.js            # Firebase Admin SDK init
│   │   └── africasTalking.js      # Africa's Talking client init
│   │
│   ├── middleware/
│   │   ├── userAuth.js            # Verifies user JWT → req.user
│   │   ├── adminAuth.js           # Verifies admin JWT → req.admin
│   │   ├── requireRole.js         # Role-based access (super_admin, admin, staff)
│   │   ├── agencyContext.js       # Injects agency_id into req.agencyId
│   │   ├── upload.js              # Multer + S3 upload middleware
│   │   ├── rateLimiter.js         # Express rate limiter configs
│   │   ├── validator.js           # express-validator error collector
│   │   └── errorHandler.js        # Global error handler
│   │
│   ├── routes/
│   │   ├── index.js               # Mounts all route groups
│   │   ├── auth.routes.js         # /api/auth/*
│   │   ├── users.routes.js        # /api/users/*
│   │   ├── candidates.routes.js   # /api/candidates/*  (public browse)
│   │   ├── vacancies.routes.js    # /api/vacancies/*   (public browse)
│   │   ├── engagement.routes.js   # /api/saved/*, /api/apply, /api/inquire
│   │   ├── conversations.routes.js
│   │   ├── notifications.routes.js
│   │   ├── categories.routes.js
│   │   └── admin/
│   │       ├── index.js           # Mounts all /api/admin/* routes
│   │       ├── auth.routes.js     # /api/admin/auth/*
│   │       ├── dashboard.routes.js
│   │       ├── candidates.routes.js
│   │       ├── vacancies.routes.js
│   │       ├── applications.routes.js
│   │       ├── inquiries.routes.js
│   │       ├── pipeline.routes.js
│   │       ├── users.routes.js
│   │       ├── staff.routes.js
│   │       └── settings.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── candidates.controller.js
│   │   ├── vacancies.controller.js
│   │   ├── engagement.controller.js
│   │   ├── conversations.controller.js
│   │   ├── notifications.controller.js
│   │   └── admin/
│   │       ├── dashboard.controller.js
│   │       ├── candidates.controller.js
│   │       ├── vacancies.controller.js
│   │       ├── applications.controller.js
│   │       ├── inquiries.controller.js
│   │       ├── pipeline.controller.js
│   │       ├── users.controller.js
│   │       ├── staff.controller.js
│   │       └── settings.controller.js
│   │
│   ├── services/
│   │   ├── notification.service.js  # Orchestrates push + SMS + in-app
│   │   ├── push.service.js          # Firebase FCM dispatch
│   │   ├── sms.service.js           # Africa's Talking dispatch
│   │   ├── storage.service.js       # S3 upload/delete/presign
│   │   ├── pipeline.service.js      # Stage transition logic
│   │   ├── otp.service.js           # OTP generation and verification
│   │   └── analytics.service.js     # View/click logging helpers
│   │
│   ├── db/
│   │   ├── migrations/              # Numbered SQL migration files
│   │   │   ├── 001_subscription_plans.sql
│   │   │   ├── 002_agencies.sql
│   │   │   ├── 003_agency_subscriptions.sql
│   │   │   ├── 004_admin_users.sql
│   │   │   ├── 005_users.sql
│   │   │   ├── 006_otp_verifications.sql
│   │   │   ├── 007_password_resets.sql
│   │   │   ├── 008_device_tokens.sql
│   │   │   ├── 009_user_profiles.sql
│   │   │   ├── 010_categories.sql
│   │   │   ├── 011_candidates.sql
│   │   │   ├── 012_candidate_details.sql
│   │   │   ├── 013_job_vacancies.sql
│   │   │   ├── 014_vacancy_requirements.sql
│   │   │   ├── 015_applications.sql
│   │   │   ├── 016_candidate_inquiries.sql
│   │   │   ├── 017_saved_items.sql
│   │   │   ├── 018_hiring_pipelines.sql
│   │   │   ├── 019_conversations.sql
│   │   │   ├── 020_notifications.sql
│   │   │   ├── 021_agency_config.sql
│   │   │   ├── 022_analytics.sql
│   │   │   └── 023_moderation.sql
│   │   ├── seeds/
│   │   │   ├── categories.sql
│   │   │   └── subscription_plans.sql
│   │   └── migrate.js               # Migration runner script
│   │
│   ├── utils/
│   │   ├── jwt.js                   # Token generation and verification helpers
│   │   ├── paginate.js              # Pagination query builder
│   │   ├── filters.js               # Dynamic filter query builder
│   │   └── logger.js                # Winston logger setup
│   │
│   ├── jobs/
│   │   └── cron.js                  # Scheduled jobs (expire vacancies, cleanup OTPs)
│   │
│   ├── app.js                       # Express app setup
│   └── server.js                    # HTTP server entry point
│
├── .env
├── .env.example
└── package.json
```

### Mobile (React Native)

```
mobile/
├── src/
│   ├── api/
│   │   ├── client.js              # Axios instance with token interceptors
│   │   ├── auth.api.js
│   │   ├── candidates.api.js
│   │   ├── vacancies.api.js
│   │   ├── engagement.api.js
│   │   ├── conversations.api.js
│   │   ├── notifications.api.js
│   │   └── admin/
│   │       ├── candidates.api.js
│   │       ├── vacancies.api.js
│   │       ├── applications.api.js
│   │       ├── inquiries.api.js
│   │       ├── pipeline.api.js
│   │       └── settings.api.js
│   │
│   ├── store/
│   │   ├── index.js               # Zustand store root
│   │   ├── auth.store.js          # User/admin auth state
│   │   ├── candidates.store.js
│   │   ├── vacancies.store.js
│   │   └── notifications.store.js
│   │
│   ├── navigation/
│   │   ├── RootNavigator.js       # Switches between Auth, User, Admin
│   │   ├── AuthNavigator.js       # Login/Register/OTP stack
│   │   ├── UserNavigator.js       # Bottom tabs for regular users
│   │   └── AdminNavigator.js      # Bottom tabs for admin users
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── OTPVerifyScreen.js
│   │   │   ├── ForgotPasswordScreen.js
│   │   │   └── AdminLoginScreen.js
│   │   ├── onboarding/
│   │   │   └── ModeSelectorScreen.js   # Pick job seeker or employer
│   │   ├── employer/
│   │   │   ├── CandidateBrowseScreen.js
│   │   │   ├── CandidateDetailScreen.js
│   │   │   ├── SavedCandidatesScreen.js
│   │   │   └── InquiryFormScreen.js
│   │   ├── jobseeker/
│   │   │   ├── VacancyBrowseScreen.js
│   │   │   ├── VacancyDetailScreen.js
│   │   │   ├── SavedVacanciesScreen.js
│   │   │   └── ApplicationFormScreen.js
│   │   ├── shared/
│   │   │   ├── ConversationsScreen.js
│   │   │   ├── ChatScreen.js
│   │   │   ├── NotificationsScreen.js
│   │   │   └── ProfileScreen.js
│   │   └── admin/
│   │       ├── DashboardScreen.js
│   │       ├── CandidateListScreen.js
│   │       ├── AddCandidateScreen.js
│   │       ├── EditCandidateScreen.js
│   │       ├── CandidateDetailScreen.js
│   │       ├── VacancyListScreen.js
│   │       ├── AddVacancyScreen.js
│   │       ├── EditVacancyScreen.js
│   │       ├── ApplicationListScreen.js
│   │       ├── ApplicationDetailScreen.js
│   │       ├── InquiryListScreen.js
│   │       ├── InquiryDetailScreen.js
│   │       ├── PipelineScreen.js
│   │       ├── PipelineDetailScreen.js
│   │       ├── UserListScreen.js
│   │       └── SettingsScreen.js
│   │
│   ├── components/
│   │   ├── cards/
│   │   │   ├── CandidateCard.js       # Candidate list card
│   │   │   └── VacancyCard.js         # Vacancy list card
│   │   ├── ui/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Badge.js
│   │   │   ├── Avatar.js
│   │   │   ├── Skeleton.js
│   │   │   ├── EmptyState.js
│   │   │   └── Modal.js
│   │   ├── ContactButtons.js          # WhatsApp / Telegram / IMO / Phone / In-App row
│   │   ├── PipelineStageBar.js        # Visual 5-stage progress bar
│   │   ├── FilterSheet.js             # Bottom sheet filter panel
│   │   ├── VideoPlayer.js             # Candidate intro video
│   │   ├── DocumentPicker.js          # Reusable document upload component
│   │   └── NotificationBell.js        # Header notification icon with unread count
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useNotifications.js        # Firebase FCM setup
│   │   ├── usePagination.js           # Infinite scroll helper
│   │   └── useDeepLink.js
│   │
│   └── utils/
│       ├── formatters.js              # Date, salary, duration formatters
│       ├── contactLinks.js            # Build WhatsApp/Telegram/IMO URLs
│       ├── validators.js
│       └── constants.js              # Stage names, country lists, categories
│
├── android/
├── ios/
├── google-services.json               # Firebase (Android)
├── GoogleService-Info.plist           # Firebase (iOS)
└── package.json
```

---

## 5. Environment Variables

### Backend `.env`

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recruitment_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRES_IN=30d
ADMIN_JWT_SECRET=different_secret_for_admins
ADMIN_JWT_EXPIRES_IN=8h

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=recruitment-agency-media
AWS_CLOUDFRONT_URL=https://d1234abcd.cloudfront.net

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Africa's Talking
AT_API_KEY=your_africas_talking_api_key
AT_USERNAME=your_username
AT_SENDER_ID=AGENCY

# OTP
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourwebdashboard.com

# App
APP_NAME=EthioRecruit
```

### Mobile `.env` (react-native-dotenv)

```env
API_BASE_URL=https://api.yourapp.com/api
```

---

## 6. Database Setup & Migrations

### Setup Script

```bash
# Create database
psql -U postgres -c "CREATE DATABASE recruitment_db;"

# Run migrations in order
node src/db/migrate.js up

# Seed initial data (categories + subscription plans)
psql -U postgres -d recruitment_db -f src/db/seeds/subscription_plans.sql
psql -U postgres -d recruitment_db -f src/db/seeds/categories.sql
```

### Migration Runner (`src/db/migrate.js`)

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigrations() {
  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    const { rows } = await pool.query(
      'SELECT id FROM schema_migrations WHERE filename = $1', [file]
    );
    if (rows.length === 0) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      console.log(`✓ Ran migration: ${file}`);
    }
  }
}

runMigrations().then(() => process.exit(0)).catch(err => {
  console.error(err); process.exit(1);
});
```

### Key Indexes (run after migrations)

```sql
-- Multi-tenancy — almost every query filters by agency_id
CREATE INDEX idx_candidates_agency_active ON candidates(agency_id, is_active);
CREATE INDEX idx_candidates_featured ON candidates(agency_id, is_featured, is_active);
CREATE INDEX idx_vacancies_agency_status ON job_vacancies(agency_id, status);
CREATE INDEX idx_admin_users_agency ON admin_users(agency_id);

-- Auth
CREATE UNIQUE INDEX idx_users_phone ON users(phone);
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_admin_email ON admin_users(email);

-- Browse & filter
CREATE INDEX idx_vacancies_country ON job_vacancies(destination_country, status);
CREATE INDEX idx_candidates_category ON candidate_categories(category_id);
CREATE INDEX idx_vacancies_category ON job_vacancies(category_id);

-- Engagement
CREATE INDEX idx_applications_vacancy ON applications(vacancy_id, status);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE UNIQUE INDEX idx_applications_unique ON applications(vacancy_id, user_id);
CREATE INDEX idx_inquiries_candidate ON candidate_inquiries(candidate_id, status);
CREATE UNIQUE INDEX idx_saved_candidates ON saved_candidates(user_id, candidate_id);
CREATE UNIQUE INDEX idx_saved_vacancies ON saved_vacancies(user_id, vacancy_id);

-- Pipeline
CREATE INDEX idx_pipeline_candidate ON hiring_pipelines(candidate_id, is_active);
CREATE INDEX idx_pipeline_stage ON hiring_pipelines(agency_id, current_stage);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_admin ON notifications(admin_user_id, is_read);

-- Conversations
CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at);

-- Analytics
CREATE INDEX idx_candidate_views_date ON candidate_views(candidate_id, viewed_at);
CREATE INDEX idx_vacancy_views_date ON vacancy_views(vacancy_id, viewed_at);

-- OTP cleanup
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);
```

---

## 7. Authentication System

### Token Strategy

Two separate JWT secrets for two separate user types. They cannot be used interchangeably.

```
User Token payload:
{
  "sub": "user-uuid",
  "type": "user",
  "mode": "job_seeker",   // or "employer"
  "iat": 1234567890,
  "exp": 1234567890
}

Admin Token payload:
{
  "sub": "admin-uuid",
  "type": "admin",
  "role": "admin",         // super_admin | admin | staff
  "agency_id": "agency-uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Registration Flow (Users)

```
1. POST /api/auth/register
   { first_name, last_name, phone, password }

2. Server creates user with is_active=false, phone_verified=false

3. POST /api/auth/otp/send
   { phone, purpose: "registration" }
   → Generates 6-digit OTP, stores in otp_verifications, sends via Africa's Talking SMS

4. POST /api/auth/otp/verify
   { phone, otp_code, purpose: "registration" }
   → Sets phone_verified=true, is_active=true
   → Returns JWT token

5. App shows ModeSelectorScreen (job_seeker or employer)

6. PUT /api/auth/mode
   { mode: "job_seeker" }  or  { mode: "employer" }
   → Updates preferred_mode on users table
```

### Login Flow (Users)

```
1. POST /api/auth/login
   { phone, password }
   → Returns JWT token + user object (with preferred_mode)

2. App routes to UserNavigator with correct mode home screen
```

### Login Flow (Admins) — Separate endpoint, separate secret

```
1. POST /api/admin/auth/login
   { email, password }
   → Returns admin JWT + admin object (with agency_id, role)

2. App shows AdminNavigator (completely separate tab structure)
```

### Password Reset Flow

```
1. POST /api/auth/forgot-password
   { phone }
   → Sends OTP via SMS

2. POST /api/auth/otp/verify
   { phone, otp_code, purpose: "password_reset" }
   → Returns reset_token (short-lived, 15 min)

3. POST /api/auth/reset-password
   { reset_token, new_password }
   → Updates password hash, invalidates token
```

### Auth Middleware (userAuth.js)

```javascript
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'user') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    req.user = { id: decoded.sub, mode: decoded.mode };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### Admin Auth Middleware (adminAuth.js)

```javascript
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (decoded.type !== 'admin') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    req.admin = {
      id: decoded.sub,
      role: decoded.role,
      agency_id: decoded.agency_id
    };
    req.agencyId = decoded.agency_id; // injected for multi-tenancy
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### Role Guard Middleware

```javascript
// requireRole.js
module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.admin) return res.status(401).json({ error: 'Unauthorized' });
  if (!allowedRoles.includes(req.admin.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Usage in routes:
router.delete('/candidates/:id', adminAuth, requireRole('super_admin', 'admin'), deleteCandidate);
```

---

## 8. API Reference

**Base URL:** `https://api.yourapp.com/api`  
**Auth:** `Authorization: Bearer <token>` on all protected routes  
**Response format:** `{ success: true, data: {} }` or `{ success: false, error: "message" }`

---

### 8.1 Auth Routes — `/api/auth`

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "first_name": "Tigist",
  "last_name": "Bekele",
  "phone": "+251911234567",
  "password": "SecurePass123!"
}
```
**Response:** `201`
```json
{
  "success": true,
  "message": "OTP sent to your phone. Verify to complete registration.",
  "data": { "user_id": "uuid" }
}
```

---

#### `POST /api/auth/login`
Login with phone and password.

**Request Body:**
```json
{ "phone": "+251911234567", "password": "SecurePass123!" }
```
**Response:** `200`
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "first_name": "Tigist",
      "last_name": "Bekele",
      "phone": "+251911234567",
      "preferred_mode": "job_seeker",
      "profile_photo_url": null
    }
  }
}
```

---

#### `POST /api/auth/otp/send`
Send OTP to phone number.

**Request Body:**
```json
{ "phone": "+251911234567", "purpose": "registration" }
```
Purposes: `registration` | `password_reset` | `login`

---

#### `POST /api/auth/otp/verify`
Verify OTP code.

**Request Body:**
```json
{
  "phone": "+251911234567",
  "otp_code": "482910",
  "purpose": "registration"
}
```
**Response (registration):** Returns `token` for immediate login after verification.

---

#### `POST /api/auth/forgot-password`
```json
{ "phone": "+251911234567" }
```

#### `POST /api/auth/reset-password`
```json
{ "reset_token": "token_from_otp_verify", "new_password": "NewPass123!" }
```

#### `PUT /api/auth/mode` 🔒 User
Switch between job seeker and employer mode.
```json
{ "mode": "employer" }
```

---

### 8.2 Admin Auth Routes — `/api/admin/auth`

#### `POST /api/admin/auth/login`
```json
{ "email": "admin@agency.com", "password": "AdminPass123!" }
```
**Response:** `200`
```json
{
  "success": true,
  "data": {
    "token": "admin_jwt_here",
    "admin": {
      "id": "uuid",
      "first_name": "Abebe",
      "last_name": "Girma",
      "email": "admin@agency.com",
      "role": "admin",
      "agency_id": "agency-uuid",
      "agency_name": "Addis Recruitment Agency"
    }
  }
}
```

---

### 8.3 User Profile Routes — `/api/users` 🔒 User

#### `GET /api/users/me`
Get current user with both profiles loaded.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "Tigist",
    "last_name": "Bekele",
    "phone": "+251911234567",
    "email": null,
    "preferred_mode": "job_seeker",
    "profile_photo_url": null,
    "jobseeker_profile": {
      "bio": "...",
      "current_country": "Ethiopia",
      "years_of_experience": 3,
      "skills": [],
      "languages": []
    },
    "employer_profile": null
  }
}
```

#### `PUT /api/users/me`
Update basic user info (name, email, photo).

#### `PUT /api/users/me/jobseeker-profile`
Update job seeker profile fields.

**Request Body:**
```json
{
  "bio": "Experienced domestic worker with 5 years abroad",
  "current_country": "Ethiopia",
  "city": "Addis Ababa",
  "education_level": "secondary",
  "years_of_experience": 5,
  "has_overseas_experience": true,
  "preferred_destination_countries": ["Saudi Arabia", "UAE", "Kuwait"],
  "availability_date": "2024-03-01",
  "skills": [
    { "skill_name": "Cooking", "proficiency_level": "advanced" },
    { "skill_name": "Childcare", "proficiency_level": "expert" }
  ],
  "languages": [
    { "language": "Amharic", "proficiency": "native" },
    { "language": "Arabic", "proficiency": "conversational" }
  ]
}
```

#### `PUT /api/users/me/employer-profile`
Update employer profile fields.

```json
{
  "company_name": "Al-Rashidi Family",
  "company_type": "individual_family",
  "country": "Saudi Arabia",
  "city": "Riyadh"
}
```

#### `POST /api/users/me/photo` (multipart/form-data)
Upload profile photo. Field name: `photo`.

#### `PUT /api/users/me/device-token`
Register/update Firebase FCM token.
```json
{ "token": "fcm_token_here", "platform": "android" }
```

---

### 8.4 Candidates — `/api/candidates` 🔒 User (Employer Mode)

#### `GET /api/candidates`
Browse and filter candidate profiles.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number (default 1) |
| `limit` | int | Per page (default 20, max 50) |
| `agency_id` | UUID | Filter by agency (required if multi-agency) |
| `category_id` | UUID | Filter by job category |
| `gender` | string | `male` / `female` |
| `min_experience` | int | Minimum years experience |
| `education_level` | string | `secondary`, `diploma`, `bachelor`, etc. |
| `medical_status` | string | `cleared` / `pending` |
| `skills` | string | Comma-separated skill names |
| `language` | string | Language name |
| `featured` | boolean | Featured candidates first |
| `search` | string | Search by name |

**Response:** `200`
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "id": "uuid",
        "first_name": "Meron",
        "last_name": "Tadesse",
        "gender": "female",
        "nationality": "Ethiopian",
        "profile_photo_url": "https://cdn.cloudfront.net/...",
        "years_of_experience": 4,
        "education_level": "secondary",
        "medical_clearance_status": "cleared",
        "is_featured": true,
        "categories": [{ "id": "uuid", "name": "Domestic Worker", "is_primary": true }],
        "top_skills": ["Cooking", "Cleaning", "Childcare"],
        "top_languages": ["Amharic", "Arabic"]
      }
    ],
    "pagination": {
      "total": 87,
      "page": 1,
      "limit": 20,
      "total_pages": 5
    }
  }
}
```

---

#### `GET /api/candidates/:id`
Get full candidate profile detail.

**Response:** `200`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "Meron",
    "last_name": "Tadesse",
    "date_of_birth": "1998-04-12",
    "gender": "female",
    "nationality": "Ethiopian",
    "religion": "Orthodox",
    "profile_photo_url": "https://cdn.cloudfront.net/...",
    "introduction_video_url": "https://cdn.cloudfront.net/...",
    "video_thumbnail_url": "https://cdn.cloudfront.net/...",
    "current_country": "Ethiopia",
    "city": "Addis Ababa",
    "summary": "Experienced and caring domestic worker...",
    "education_level": "secondary",
    "years_of_experience": 4,
    "medical_clearance_status": "cleared",
    "medical_clearance_date": "2024-01-10",
    "visa_status": "no_visa",
    "availability_date": "2024-02-01",
    "is_featured": true,
    "categories": [],
    "skills": [
      { "skill_name": "Cooking", "proficiency_level": "expert", "years_experience": 4 }
    ],
    "languages": [
      { "language": "Amharic", "proficiency": "native" },
      { "language": "Arabic", "proficiency": "conversational" }
    ],
    "experience": [
      {
        "job_title": "Housemaid",
        "employer_name": "Private Family",
        "country": "Saudi Arabia",
        "start_date": "2020-01-01",
        "end_date": "2022-12-31",
        "is_current": false
      }
    ],
    "education": [],
    "agency": {
      "id": "uuid",
      "name": "Addis Recruitment Agency",
      "contact_channels": [
        { "channel_type": "whatsapp", "channel_value": "+251911000000", "is_primary": true },
        { "channel_type": "telegram", "channel_value": "@addisrecruit" },
        { "channel_type": "phone", "channel_value": "+251112345678" }
      ]
    }
  }
}
```

---

#### `POST /api/candidates/:id/inquiry` 🔒 User (Employer Mode)
Submit an inquiry about a candidate.

```json
{
  "message": "I am looking for a housemaid for a family of 4 in Riyadh.",
  "preferred_contact_channel": "whatsapp",
  "purpose": "Domestic work — cleaning, cooking, childcare",
  "required_start_date": "2024-03-01"
}
```

---

### 8.5 Vacancies — `/api/vacancies` 🔒 User (Job Seeker Mode)

#### `GET /api/vacancies`
Browse and filter job vacancies.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | int | Page number |
| `limit` | int | Per page (default 20) |
| `agency_id` | UUID | Filter by agency |
| `category_id` | UUID | Job category |
| `destination_country` | string | e.g. `Saudi Arabia` |
| `gender` | string | `male` / `female` / `any` |
| `min_salary` | decimal | Minimum salary |
| `visa_sponsorship` | boolean | Filter by visa included |
| `accommodation` | boolean | Filter by accommodation included |
| `featured` | boolean | |
| `search` | string | Search by title |

**Response:** Paginated list of vacancies with summary fields.

---

#### `GET /api/vacancies/:id`
Full vacancy detail including all benefits, requirements, and agency contact info.

---

#### `POST /api/vacancies/:id/apply` 🔒 User (Job Seeker Mode)
Apply to a vacancy.

```json
{
  "cover_letter": "I am very interested in this position...",
  "additional_notes": "I am available immediately."
}
```

---

### 8.6 Engagement — Saved Items 🔒 User

#### `POST /api/saved/candidates/:id` — Save a candidate
#### `DELETE /api/saved/candidates/:id` — Unsave a candidate
#### `GET /api/saved/candidates` — List saved candidates (paginated)

#### `POST /api/saved/vacancies/:id` — Save a vacancy
#### `DELETE /api/saved/vacancies/:id` — Unsave a vacancy
#### `GET /api/saved/vacancies` — List saved vacancies (paginated)

---

### 8.7 Conversations — `/api/conversations` 🔒 User

#### `GET /api/conversations`
List all conversations for the current user.

```json
{
  "data": [
    {
      "id": "uuid",
      "agency": { "id": "uuid", "name": "Addis Recruit", "logo_url": "..." },
      "context_type": "candidate_inquiry",
      "last_message_preview": "Thank you for your inquiry...",
      "last_message_at": "2024-01-15T10:30:00Z",
      "unread_count": 2
    }
  ]
}
```

#### `GET /api/conversations/:id/messages`
Get messages in a conversation (paginated, newest last).

#### `POST /api/conversations/:id/messages`
Send a message.
```json
{ "message_text": "Hello, is this candidate still available?" }
```

#### `POST /api/conversations/:id/messages/attachment` (multipart)
Send attachment. Field: `attachment`. Returns attachment URL.

---

### 8.8 Notifications — `/api/notifications` 🔒 User

#### `GET /api/notifications`
List notifications, newest first.
```json
{ "data": { "notifications": [], "unread_count": 5 } }
```

#### `PUT /api/notifications/:id/read`
Mark one notification as read.

#### `PUT /api/notifications/read-all`
Mark all as read.

---

### 8.9 Categories — `/api/categories` (public)

#### `GET /api/categories`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Domestic Worker",
      "name_ar": "عاملة منزلية",
      "name_am": "የቤት ሠራተኛ",
      "icon_url": "...",
      "subcategories": [
        { "id": "uuid", "name": "Housemaid" },
        { "id": "uuid", "name": "Nanny / Childcare" },
        { "id": "uuid", "name": "Elderly Care" }
      ]
    },
    { "id": "uuid", "name": "Driver", "name_ar": "سائق" },
    { "id": "uuid", "name": "Cook / Chef" },
    { "id": "uuid", "name": "Security Guard" },
    { "id": "uuid", "name": "Nurse / Healthcare" },
    { "id": "uuid", "name": "Cleaner" }
  ]
}
```

---

### 8.10 Admin — Dashboard 🔒 Admin

#### `GET /api/admin/dashboard/stats`
```json
{
  "data": {
    "candidates": { "total": 143, "active": 131, "deployed": 12 },
    "vacancies": { "total": 28, "active": 19, "closed": 9 },
    "applications": { "total": 204, "this_week": 17, "pending_review": 31 },
    "inquiries": { "total": 89, "unread": 7 },
    "pipeline": {
      "interviewing": 8,
      "medical_biometrics": 5,
      "visa_processing": 6,
      "pre_departure_training": 3,
      "deployed": 12
    }
  }
}
```

#### `GET /api/admin/dashboard/recent-activity`
Returns last 20 activity log entries.

---

### 8.11 Admin — Candidates 🔒 Admin

#### `GET /api/admin/candidates`
List all candidates for this agency. Same filters as public browse, plus `status` filter (active/inactive/deployed).

#### `POST /api/admin/candidates`
Create a new candidate profile.

**Request Body:**
```json
{
  "first_name": "Hana",
  "last_name": "Worku",
  "date_of_birth": "2000-06-15",
  "gender": "female",
  "nationality": "Ethiopian",
  "religion": "Orthodox",
  "current_country": "Ethiopia",
  "city": "Hawassa",
  "summary": "Hardworking domestic worker with experience in the Gulf.",
  "education_level": "secondary",
  "years_of_experience": 2,
  "medical_clearance_status": "pending",
  "availability_date": "2024-02-15",
  "category_ids": [{ "category_id": "uuid", "is_primary": true }],
  "skills": [
    { "skill_name": "Cooking", "proficiency_level": "intermediate" },
    { "skill_name": "Cleaning", "proficiency_level": "advanced" }
  ],
  "languages": [
    { "language": "Amharic", "proficiency": "native" },
    { "language": "Arabic", "proficiency": "basic" }
  ],
  "experience": [
    {
      "job_title": "Housemaid",
      "employer_name": "Private Family",
      "country": "Kuwait",
      "start_date": "2021-03-01",
      "end_date": "2023-01-01"
    }
  ]
}
```
**Response:** `201` with created candidate including `id`.

#### `GET /api/admin/candidates/:id`
Full candidate detail with all related data.

#### `PUT /api/admin/candidates/:id`
Update any candidate field.

#### `DELETE /api/admin/candidates/:id` (soft delete — requires admin role)
Sets `is_active = false`.

#### `PUT /api/admin/candidates/:id/feature`
Toggle featured status.
```json
{ "is_featured": true }
```

#### `PUT /api/admin/candidates/:id/medical`
Update medical clearance.
```json
{
  "medical_clearance_status": "cleared",
  "medical_clearance_date": "2024-01-20",
  "medical_clearance_expiry": "2025-01-20"
}
```

---

### 8.12 Admin — Candidate Media & Documents 🔒 Admin

#### `POST /api/admin/candidates/:id/photo` (multipart/form-data)
Upload candidate profile photo.
- Field name: `photo`
- Accepted: `image/jpeg`, `image/png`, `image/webp`
- Max size: 5MB
- Returns: `{ photo_url: "https://cdn.cloudfront.net/..." }`

#### `POST /api/admin/candidates/:id/video` (multipart/form-data)
Upload introduction video.
- Field name: `video`
- Accepted: `video/mp4`, `video/mov`
- Max size: 100MB
- Returns: `{ video_url: "...", thumbnail_url: "..." }`

#### `POST /api/admin/candidates/:id/documents` (multipart/form-data)
Upload a document.
- Fields: `document` (file), `document_type`, `expiry_date` (optional)
- Returns: full document object

#### `DELETE /api/admin/candidates/:id/documents/:documentId`
Remove a document.

---

### 8.13 Admin — Job Vacancies 🔒 Admin

#### `GET /api/admin/vacancies`
List vacancies with filters: `status`, `category_id`, `destination_country`.

#### `POST /api/admin/vacancies`
Create a new job vacancy (saves as `draft` unless `publish: true`).

**Request Body:**
```json
{
  "title": "Housemaid — Riyadh Family",
  "description": "We are looking for a hardworking housemaid...",
  "requirements": "Minimum 2 years experience, Arabic speaker preferred.",
  "category_id": "uuid",
  "destination_country": "Saudi Arabia",
  "city": "Riyadh",
  "employer_type": "individual_family",
  "employer_name": "Al-Zahrani Family",
  "show_employer_name": false,
  "salary_min": 400,
  "salary_max": 500,
  "salary_currency": "USD",
  "contract_duration_months": 24,
  "working_hours_per_day": 8,
  "working_days_per_week": 6,
  "visa_sponsorship": true,
  "accommodation_provided": true,
  "meals_provided": true,
  "transportation_provided": false,
  "health_insurance": true,
  "annual_leave_days": 30,
  "gender_preference": "female",
  "age_min": 22,
  "age_max": 40,
  "experience_required_years": 2,
  "positions_available": 1,
  "application_deadline": "2024-03-15",
  "skills_required": [
    { "skill_name": "Cooking", "is_required": true },
    { "skill_name": "Arabic", "is_required": false }
  ],
  "publish": false
}
```

#### `GET /api/admin/vacancies/:id`
Full vacancy detail.

#### `PUT /api/admin/vacancies/:id`
Update any vacancy field.

#### `PUT /api/admin/vacancies/:id/publish`
Publish a draft vacancy. Sets `status = active`, `published_at = NOW()`.

#### `PUT /api/admin/vacancies/:id/pause`
Temporarily hide from job seekers. Sets `status = paused`.

#### `PUT /api/admin/vacancies/:id/close`
Close vacancy. Sets `status = closed`.

---

### 8.14 Admin — Applications 🔒 Admin

#### `GET /api/admin/applications`
List applications. Filters: `vacancy_id`, `status`.

**Response includes** applicant snapshot (name, phone) + vacancy title.

#### `GET /api/admin/applications/:id`
Full application detail with user's full profile.

#### `PUT /api/admin/applications/:id/status`
Update application status and optionally notify the applicant.

```json
{
  "status": "shortlisted",
  "reviewer_notes": "Strong candidate, matches requirements.",
  "notify_applicant": true
}
```

Statuses: `submitted` → `under_review` → `shortlisted` → `selected` | `rejected`

When status changes, the notification service fires automatically:
- Push notification to the user's device
- (Optional) SMS via Africa's Talking if push fails

---

### 8.15 Admin — Inquiries 🔒 Admin

#### `GET /api/admin/inquiries`
List inquiries. Filters: `status` (`new`, `read`, `responded`, `closed`), `candidate_id`.

#### `GET /api/admin/inquiries/:id`
Full inquiry detail with candidate info and employer profile.

#### `PUT /api/admin/inquiries/:id/respond`
Mark as responded and store admin response.
```json
{
  "admin_response": "Thank you for your interest. This candidate is available from March 2024.",
  "status": "responded"
}
```

#### `PUT /api/admin/inquiries/:id/close`
Archive/close the inquiry.

---

### 8.16 Admin — Hiring Pipeline 🔒 Admin

#### `GET /api/admin/pipeline`
List all active pipeline entries. Filters: `current_stage`, `candidate_id`.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "candidate": { "id": "uuid", "first_name": "Meron", "photo_url": "..." },
      "current_stage": "visa_processing",
      "employer_name": "Al-Zahrani Family",
      "employer_country": "Saudi Arabia",
      "started_at": "2024-01-05T00:00:00Z",
      "expected_deployment_date": "2024-03-01",
      "days_in_current_stage": 14
    }
  ]
}
```

#### `POST /api/admin/pipeline`
Start a new hiring pipeline for a candidate.

```json
{
  "candidate_id": "uuid",
  "vacancy_id": "uuid",
  "application_id": "uuid",
  "employer_name": "Al-Zahrani Family",
  "employer_country": "Saudi Arabia",
  "employer_city": "Riyadh",
  "employer_contact": "+966501234567",
  "current_stage": "interviewing",
  "expected_deployment_date": "2024-03-01",
  "notes": "Employer met candidate via video call."
}
```

#### `GET /api/admin/pipeline/:id`
Full pipeline detail with full stage history and all attached documents.

#### `PUT /api/admin/pipeline/:id/stage`
Advance or change stage. Automatically writes to `pipeline_stage_history`.

```json
{
  "stage": "medical_biometrics",
  "notes": "Interview passed. Scheduling medical appointment."
}
```

**Valid stage transitions:**
```
interviewing → medical_biometrics
medical_biometrics → visa_processing
visa_processing → pre_departure_training
pre_departure_training → deployed
```
Any stage can also move to a `cancelled` outcome.

#### `POST /api/admin/pipeline/:id/documents` (multipart/form-data)
Attach document to pipeline.
- Fields: `document` (file), `document_type`, `notes`
- Types: `offer_letter`, `contract`, `medical_report`, `visa`, `flight_ticket`, `other`

#### `PUT /api/admin/pipeline/:id/outcome`
Record final outcome.
```json
{
  "outcome": "successful",
  "actual_deployment_date": "2024-02-28",
  "contract_end_date": "2026-02-28",
  "outcome_notes": "Candidate deployed successfully."
}
```

---

### 8.17 Admin — Users Management 🔒 Admin

#### `GET /api/admin/users`
List registered users. Filters: `is_blocked`, `mode`, `search` (name/phone).

#### `GET /api/admin/users/:id`
User detail with both profiles, application history, inquiry history.

#### `PUT /api/admin/users/:id/block`
```json
{ "reason": "Spam/abusive behavior" }
```

#### `PUT /api/admin/users/:id/unblock`
Removes block.

---

### 8.18 Admin — Staff Management 🔒 Super Admin only

#### `GET /api/admin/staff`
List admin users for this agency.

#### `POST /api/admin/staff`
Create a new staff member.
```json
{
  "first_name": "Sara",
  "last_name": "Haile",
  "email": "sara@agency.com",
  "phone": "+251922345678",
  "role": "staff",
  "password": "TempPass123!"
}
```

#### `PUT /api/admin/staff/:id`
Update staff role or status.

#### `DELETE /api/admin/staff/:id`
Deactivate staff (`is_active = false`). Cannot delete super_admin.

---

### 8.19 Admin — Settings 🔒 Admin

#### `GET /api/admin/settings`
Get agency settings and contact channels.

#### `PUT /api/admin/settings`
Update settings.
```json
{
  "allow_in_app_applications": true,
  "show_salary_in_vacancies": true,
  "notify_admin_on_new_inquiry": true
}
```

#### `GET /api/admin/contact-channels`
List agency contact channels.

#### `POST /api/admin/contact-channels`
```json
{
  "channel_type": "whatsapp",
  "channel_value": "+251911000000",
  "label": "Hiring Department",
  "is_primary": true
}
```

#### `PUT /api/admin/contact-channels/:id`
Update a contact channel.

#### `DELETE /api/admin/contact-channels/:id`
Remove a contact channel.

---

## 9. File Storage — AWS S3 + CloudFront

### S3 Bucket Structure

```
recruitment-agency-media/
├── agencies/
│   └── {agency_id}/
│       ├── logos/
│       │   └── {filename}.jpg
│       └── banners/
│           └── {filename}.jpg
│
├── candidates/
│   └── {agency_id}/
│       └── {candidate_id}/
│           ├── photos/
│           │   └── profile.jpg
│           ├── videos/
│           │   ├── intro.mp4
│           │   └── thumbnail.jpg
│           └── documents/
│               ├── passport.pdf
│               ├── medical_certificate.pdf
│               └── ...
│
├── pipeline/
│   └── {agency_id}/
│       └── {pipeline_id}/
│           ├── offer_letter.pdf
│           ├── visa.pdf
│           └── flight_ticket.pdf
│
└── users/
    └── {user_id}/
        └── profile_photo.jpg
```

### Upload Flow

```javascript
// storage.service.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const s3 = new S3Client({ region: process.env.AWS_REGION });

async function uploadFile({ buffer, mimetype, folder, filename }) {
  const ext = mimetype.split('/')[1];
  const key = `${folder}/${filename || uuidv4()}.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  // Return CloudFront URL
  return `${process.env.AWS_CLOUDFRONT_URL}/${key}`;
}

async function deleteFile(cloudFrontUrl) {
  const key = cloudFrontUrl.replace(`${process.env.AWS_CLOUDFRONT_URL}/`, '');
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  }));
}

module.exports = { uploadFile, deleteFile };
```

### S3 Bucket Policy (IAM — least privilege)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::recruitment-agency-media/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::recruitment-agency-media/*",
      "Principal": { "Service": "cloudfront.amazonaws.com" }
    }
  ]
}
```

### CloudFront Configuration

- **Origin:** S3 bucket (OAC — Origin Access Control, not public)
- **Cache policy:** 1 year for media (photos, videos), 0 for documents
- **Signed URLs:** Use for sensitive documents (not needed for candidate photos which are semi-public)

---

## 10. Push Notifications — Firebase

### Setup

1. Create Firebase project at console.firebase.google.com
2. Add iOS and Android apps to the project
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Generate a service account key for the backend (Admin SDK)

### Backend — Dispatch Service

```javascript
// services/push.service.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

async function sendPushNotification({ token, title, body, data = {} }) {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } }
    });
  } catch (err) {
    // If token is invalid, deactivate it in device_tokens
    if (err.code === 'messaging/registration-token-not-registered') {
      await db.query('UPDATE device_tokens SET is_active = false WHERE token = $1', [token]);
    }
    console.error('Push failed:', err.message);
  }
}

async function sendToUser(userId, { title, body, data }) {
  const { rows } = await db.query(
    'SELECT token FROM device_tokens WHERE user_id = $1 AND is_active = true',
    [userId]
  );
  for (const row of rows) {
    await sendPushNotification({ token: row.token, title, body, data });
  }
}
```

### Notification Types and Triggers

| Event | Recipient | Title | Body |
|---|---|---|---|
| Application submitted | Admin | "New Application" | "{name} applied for {vacancy}" |
| Application status changed | User | "Application Update" | "Your application for {vacancy} is now {status}" |
| New candidate inquiry | Admin | "New Inquiry" | "An employer inquired about {candidate}" |
| Inquiry responded | User | "Inquiry Update" | "The agency responded to your inquiry" |
| Pipeline stage changed | User (if job seeker applied) | "Hiring Update" | "Process moved to {stage}" |
| New vacancy posted | All job seekers | "New Job Available" | "{title} in {country}" |
| New candidate added | All employers | "New Candidate Available" | "A new {category} is available" |

### Mobile — FCM Setup

```javascript
// hooks/useNotifications.js
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import api from '../api/client';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    async function setup() {
      const permission = await messaging().requestPermission();
      if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
        const token = await messaging().getToken();
        await api.put('/users/me/device-token', {
          token, platform: Platform.OS
        });
      }
    }

    setup();

    // Foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Show local notification using @notifee/react-native
      await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
      });
    });

    return unsubscribe;
  }, [isAuthenticated]);
}
```

---

## 11. SMS — Africa's Talking

### Setup

```javascript
// config/africasTalking.js
const AfricasTalking = require('africastalking');

const client = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

module.exports = client.SMS;
```

### SMS Service

```javascript
// services/sms.service.js
const sms = require('../config/africasTalking');

async function sendSMS({ to, message }) {
  try {
    await sms.send({
      to: Array.isArray(to) ? to : [to],
      message,
      from: process.env.AT_SENDER_ID
    });
  } catch (err) {
    console.error('SMS failed:', err.message);
    // Do not throw — SMS is non-blocking
  }
}

async function sendOTP({ phone, otp, purpose }) {
  const messages = {
    registration: `Your EthioRecruit verification code is: ${otp}. Valid for 10 minutes.`,
    password_reset: `Your EthioRecruit password reset code is: ${otp}. Valid for 10 minutes.`
  };
  await sendSMS({ to: phone, message: messages[purpose] || `Your code is: ${otp}` });
}

module.exports = { sendSMS, sendOTP };
```

### OTP Generation

```javascript
// services/otp.service.js
const crypto = require('crypto');

function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
}

async function createAndSendOTP({ phone, purpose, userId = null }) {
  const otp = generateOTP(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate previous OTPs for this phone+purpose
  await db.query(
    'DELETE FROM otp_verifications WHERE identifier = $1 AND purpose = $2',
    [phone, purpose]
  );

  // Store new OTP
  await db.query(
    `INSERT INTO otp_verifications
     (identifier, identifier_type, otp_code, purpose, user_id, expires_at)
     VALUES ($1, 'phone', $2, $3, $4, $5)`,
    [phone, otp, purpose, userId, expiresAt]
  );

  // Send via SMS
  await sendOTP({ phone, otp, purpose });

  return { otp }; // only return in dev/test environments
}
```

---

## 12. Multi-tenancy Model

Every agency is fully isolated. The `agency_id` column is the tenancy key.

### Rules

1. Every `candidates`, `job_vacancies`, `admin_users`, `applications`, `inquiries`, and `hiring_pipelines` row has an `agency_id`.
2. Admin JWTs carry `agency_id` in the payload. All admin queries automatically filter by `req.admin.agency_id`.
3. Regular users see candidates and vacancies from any agency (the app is multi-agency from the user perspective).
4. Admins from Agency A can never query, modify, or see Agency B's data.
5. Conversations are always between a user and an agency — identified by `agency_id` on the conversation.

### Agency Context Middleware

```javascript
// middleware/agencyContext.js
// For admin routes: agency_id comes from the JWT
module.exports.adminAgency = (req, res, next) => {
  if (!req.admin?.agency_id) {
    return res.status(403).json({ error: 'No agency context' });
  }
  req.agencyId = req.admin.agency_id;
  next();
};

// All admin DB queries must include WHERE agency_id = $agencyId
// Example:
const { rows } = await db.query(
  'SELECT * FROM candidates WHERE agency_id = $1 AND id = $2',
  [req.agencyId, req.params.id]
);
if (!rows[0]) return res.status(404).json({ error: 'Not found' });
// Never trust the row without the agency_id check
```

---

## 13. Admin Panel — Features & Flows

### Dashboard Screen
- Stats cards: total candidates, active vacancies, pending applications, unread inquiries
- Pipeline kanban counts per stage
- Recent activity feed (last 10 admin actions)
- Quick action buttons: Add Candidate, Post Vacancy

### Candidate Management

**List Screen:**
- Search by name
- Filter by category, medical status, featured
- Each card shows photo, name, category badges, experience years, medical status badge
- Tap to open detail; long press for quick actions (feature/unfeature, deactivate)

**Add Candidate Screen (multi-step form):**
- Step 1: Personal info (name, DOB, gender, nationality, religion)
- Step 2: Photo upload + video upload
- Step 3: Skills (add/remove chips), Languages
- Step 4: Work experience (add entries)
- Step 5: Education, Medical status
- Step 6: Documents upload (passport, medical cert, COC)
- Step 7: Preview & publish

**Edit Candidate:** Same form pre-populated, each section editable independently.

### Vacancy Management

**List Screen:**
- Filter by status (draft/active/paused/closed)
- Each card shows title, destination country, salary, positions available, deadline
- Status badge colored: green=active, orange=paused, red=closed, gray=draft

**Add Vacancy Screen:**
- Basic info (title, category, description, requirements)
- Location (destination country, city)
- Employer info (name — with toggle to hide from app)
- Compensation (salary range, currency, negotiable toggle)
- Contract terms (duration, hours, days per week)
- Benefits (checkboxes: visa, accommodation, meals, transport, health insurance)
- Candidate requirements (gender, age range, experience, education)
- Skills/languages needed
- Save as draft or publish immediately

### Applications Management

**List Screen:**
- Tabs: All | Submitted | Under Review | Shortlisted | Selected | Rejected
- Each row shows applicant name, phone, vacancy name, applied date
- Tap to open detail

**Application Detail:**
- Applicant info (name, phone, photo link to their profile)
- Cover letter
- Status change dropdown with notes field
- History log of status changes
- Quick contact button

### Inquiries Management

**List Screen:**
- Tabs: New | Read | Responded | Closed
- Each row shows employer name/phone, candidate name, received date, preferred contact
- Unread count badge on tab

**Inquiry Detail:**
- Employer profile (company type, country, city)
- Candidate photo + link to profile
- Message
- Preferred contact channel (with one-tap launch buttons)
- Admin response text field
- Mark as Responded / Close buttons

### Hiring Pipeline

**Pipeline Screen:**
- 5-column view (or list view on mobile) showing counts per stage
- Each entry: candidate photo, name, employer, days in current stage
- Color-coded urgency (green < 7 days, yellow 7-14, red > 14)

**Pipeline Detail:**
- Candidate info card
- Employer info
- Stage progress bar (5 steps visual)
- "Advance to Next Stage" button
- Stage history timeline
- Documents section (upload/view per stage)
- Notes area
- Outcome button (Successful / Cancelled)

### Settings

- Agency contact channels management (add/edit/delete WhatsApp, Telegram, IMO, phone, email)
- Feature toggles (in-app applications, in-app inquiries, show salary)
- Staff management (invite staff, change roles, deactivate)
- Agency profile (name, logo, license info)

---

## 14. User App — Screens & Flows

### Auth Flow

```
WelcomeScreen
├── Login → LoginScreen → (if success) → UserNavigator
├── Register → RegisterScreen → OTPVerifyScreen → ModeSelectorScreen → UserNavigator
└── Admin? → AdminLoginScreen → AdminNavigator
```

**WelcomeScreen:** Agency branding, tagline, Login / Register / Admin Login buttons.

**LoginScreen:** Phone input + password + "Forgot password?" link.

**RegisterScreen:** First name, last name, phone, password, confirm password.

**OTPVerifyScreen:** 6-digit OTP input with countdown timer (10 min), resend button.

**ModeSelectorScreen (one-time, shown after registration):**
- "I'm looking to hire staff" → sets mode to employer
- "I'm looking for a job abroad" → sets mode to job seeker
- Can be changed later from Profile screen

### User Navigator Structure

```
Bottom Tabs:
├── Home (feed based on mode)
├── Saved
├── Messages
├── Notifications
└── Profile
```

### Employer Mode — Candidate Browse

**CandidateBrowseScreen (Home for employers):**
- Search bar at top
- Filter button (opens FilterSheet bottom sheet)
- FlashList of CandidateCards
- Featured candidates appear first (gold badge)
- Pull to refresh, infinite scroll

**FilterSheet:**
- Category (multi-select chips)
- Gender (Any / Male / Female)
- Medical Status (Any / Cleared)
- Minimum Experience (slider)
- Education Level (dropdown)
- Language (text input)

**CandidateCard Component:**
- Candidate photo (FastImage, circular)
- Name + nationality
- Primary category badge
- Top 3 skills as chips
- Years of experience
- Medical status badge (green "Cleared" or gray "Pending")
- Featured badge if applicable
- "View Profile" tap target

**CandidateDetailScreen:**
- Full-width profile photo header
- Name, nationality, religion, age
- Introduction video player (if available) — auto-thumbnail
- Summary text
- Medical clearance status banner
- Skills section (proficiency bars)
- Languages section
- Work experience timeline
- Education
- **Contact Buttons Row** (always visible, fixed at bottom):
  - 📱 Call
  - 💬 WhatsApp
  - ✈️ Telegram
  - 📟 IMO
  - ✉️ Send Inquiry (opens InquiryFormScreen)
- Save / Unsave bookmark button in header

**Contact Button Behavior:**
```javascript
// utils/contactLinks.js
const openWhatsApp = (phone, message) => {
  const encoded = encodeURIComponent(message);
  Linking.openURL(`https://wa.me/${phone}?text=${encoded}`);
};

const openTelegram = (username) => {
  Linking.openURL(`https://t.me/${username}`);
};

const openIMO = (phone) => {
  Linking.openURL(`imo://chat?phone=${phone}`);
};
```

**InquiryFormScreen:**
- Candidate summary card at top
- Message textarea
- Preferred contact channel selector
- Purpose of hire text input
- Required start date picker
- Submit button

### Job Seeker Mode — Vacancy Browse

**VacancyBrowseScreen (Home for job seekers):**
- Search bar
- Category horizontal scroll chips at top
- Filter button
- FlashList of VacancyCards
- Featured vacancies appear first

**FilterSheet (Job Seeker):**
- Destination Country (dropdown)
- Minimum Salary
- Visa Sponsorship (toggle)
- Accommodation Provided (toggle)
- Gender Preference (Any / My Gender)
- Contract Duration

**VacancyCard Component:**
- Country flag emoji + destination country name
- Job title (bold)
- Employer type label (Individual Family / Business — anonymous if hidden)
- Salary range + currency
- Benefit icons row: 🛂 Visa  🏠 Accommodation  🍽️ Meals  🚗 Transport
- Positions available count
- Application deadline with urgency color (green / yellow / red)
- Bookmark icon (save/unsave)

**VacancyDetailScreen:**
- Agency logo + name header
- Job title + category badge
- 📍 Destination: Country, City
- 💰 Salary range + currency + "Negotiable" if applicable
- 📋 Contract: duration in months, hours/day, days/week
- ✅ Benefits checklist (visa sponsorship, accommodation, meals, transport, health insurance, annual leave days)
- 👤 Requirements: gender preference, age range, min experience, education level
- 🔧 Required skills list
- 🗣️ Required languages list
- Full job description text
- Full requirements text
- Application deadline date
- **Fixed Bottom Action Bar:**
  - "Apply Now" button (primary) — if in-app applications enabled
  - "Contact Agency" button (secondary) — opens contact channel sheet
- Save / Unsave in header

**ApplicationFormScreen:**
- Vacancy summary card at top (title, country, salary)
- Cover letter textarea (optional but encouraged)
- Additional notes textarea
- Applicant phone pre-filled and read-only (from account)
- Terms acknowledgment checkbox
- "Submit Application" button with confirmation dialog
- Success state: confirmation message + "View My Applications" link

---

### Shared User Screens

**ConversationsScreen:**
- Search bar for filtering threads
- List sorted by last_message_at (newest first)
- Each row: agency logo (circular), agency name, context badge (Inquiry / Application / General), message preview, timestamp, unread count badge
- Empty state: "No conversations yet. Inquire about a candidate or apply to a vacancy to start a conversation."
- Tap → ChatScreen

**ChatScreen:**
- Header: agency name + context (e.g., "Inquiry: Meron T.")
- Message list (FlatList, inverted for newest-at-bottom)
- User messages: right-aligned, primary color bubble
- Agency messages: left-aligned, gray bubble
- Timestamps shown between messages (grouped by day)
- Attachment messages show preview + download icon
- Input bar: text field + attachment button + send button
- Load more (pagination) when scrolling up

**NotificationsScreen:**
- Filter tabs: All | Unread
- Each row: icon (type-based), title, body preview, time ago, unread indicator dot
- Tap: mark as read + navigate to relevant screen via action_type + action_id
- Swipe left to delete
- "Mark all as read" button in header
- Empty state per tab

**ProfileScreen:**
- Profile photo (tappable to edit)
- Full name + phone
- **Mode Switcher:** segmented control — "Looking to Hire" / "Looking for Work"
  - Switching mode immediately changes the Home tab content
  - No re-login required — just updates preferred_mode via API
- Edit Profile → opens profile edit form
- **Section: My Activity**
  - "My Applications" (job seeker) OR "My Inquiries" (employer)
  - "Saved Candidates" (employer) OR "Saved Vacancies" (job seeker)
- **Section: Account**
  - Notification Preferences
  - Change Password
  - Language (English / Amharic / Arabic)
  - Help & Support
  - Logout (with confirmation)

---

## 15. Hiring Pipeline Logic

### Stages (in order)

```
1. interviewing          — Candidate and employer are in communication / interview process
2. medical_biometrics    — Medical exam, biometric data collection at immigration
3. visa_processing       — Visa application submitted, waiting for approval
4. pre_departure_training — Mandatory training before travel
5. deployed              — Candidate has traveled and is on assignment
```

### Stage Transition Rules

```javascript
// services/pipeline.service.js
const STAGE_ORDER = [
  'interviewing',
  'medical_biometrics',
  'visa_processing',
  'pre_departure_training',
  'deployed'
];

async function advanceStage(pipelineId, newStage, adminId, notes) {
  const { rows: [pipeline] } = await db.query(
    'SELECT * FROM hiring_pipelines WHERE id = $1',
    [pipelineId]
  );
  if (!pipeline) throw new Error('Pipeline not found');

  const currentIdx = STAGE_ORDER.indexOf(pipeline.current_stage);
  const newIdx = STAGE_ORDER.indexOf(newStage);
  if (newIdx <= currentIdx) {
    throw new Error('Can only advance to a later stage');
  }

  const now = new Date();

  // Close current stage in history (compute duration)
  await db.query(
    `UPDATE pipeline_stage_history
     SET exited_at = $1,
         duration_days = EXTRACT(DAY FROM ($1 - entered_at))::INTEGER
     WHERE pipeline_id = $2 AND exited_at IS NULL`,
    [now, pipelineId]
  );

  // Open new stage history entry
  await db.query(
    `INSERT INTO pipeline_stage_history
     (pipeline_id, stage, entered_at, notes, updated_by)
     VALUES ($1, $2, $3, $4, $5)`,
    [pipelineId, newStage, now, notes || null, adminId]
  );

  // Update pipeline current_stage
  await db.query(
    'UPDATE hiring_pipelines SET current_stage = $1, updated_at = $2 WHERE id = $3',
    [newStage, now, pipelineId]
  );

  // If deployed — mark candidate as deployed
  if (newStage === 'deployed') {
    await db.query(
      'UPDATE candidates SET is_deployed = true, updated_at = $1 WHERE id = $2',
      [now, pipeline.candidate_id]
    );
  }

  // Write activity log
  await db.query(
    `INSERT INTO activity_logs
     (agency_id, admin_user_id, action, entity_type, entity_id, new_values)
     VALUES ($1, $2, 'stage_changed', 'pipeline', $3, $4)`,
    [
      pipeline.agency_id, adminId, pipelineId,
      JSON.stringify({ from: pipeline.current_stage, to: newStage })
    ]
  );
}
```

### Pipeline Outcome Recording

When a pipeline concludes (successfully or not):

```javascript
async function recordOutcome(pipelineId, { outcome, notes, deploymentDate, contractEndDate }, adminId) {
  const validOutcomes = ['successful', 'cancelled', 'candidate_withdrew', 'employer_cancelled'];
  if (!validOutcomes.includes(outcome)) throw new Error('Invalid outcome');

  await db.query(
    `UPDATE hiring_pipelines SET
       is_active = false,
       outcome = $1,
       outcome_notes = $2,
       outcome_date = $3,
       actual_deployment_date = $4,
       contract_end_date = $5,
       updated_at = NOW()
     WHERE id = $6`,
    [outcome, notes, new Date(), deploymentDate || null, contractEndDate || null, pipelineId]
  );

  // If cancelled — mark candidate as available again
  if (outcome !== 'successful') {
    const { rows: [p] } = await db.query(
      'SELECT candidate_id FROM hiring_pipelines WHERE id = $1',
      [pipelineId]
    );
    await db.query(
      'UPDATE candidates SET is_deployed = false WHERE id = $1',
      [p.candidate_id]
    );
  }
}
```

### Pipeline Stage UI (PipelineStageBar Component)

```javascript
// components/PipelineStageBar.js
const STAGES = [
  { key: 'interviewing',          label: 'Interview',   icon: '🎤' },
  { key: 'medical_biometrics',    label: 'Medical',     icon: '🏥' },
  { key: 'visa_processing',       label: 'Visa',        icon: '🛂' },
  { key: 'pre_departure_training',label: 'Training',    icon: '📚' },
  { key: 'deployed',              label: 'Deployed',    icon: '✈️' },
];

// Renders 5 circles connected by a line
// Completed stages: filled with brand color
// Current stage: filled + animated pulse
// Future stages: gray outline
```

---

## 16. Security Considerations

### Password Hashing

```javascript
const bcrypt = require('bcryptjs');

// On registration
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// On login
const isMatch = await bcrypt.compare(plainPassword, storedHash);
```

### JWT Best Practices

- User JWT secret and Admin JWT secret are **different** and **never shared**
- Admin tokens expire in 8 hours (short session for sensitive operations)
- User tokens expire in 30 days
- Token type (`user` vs `admin`) is validated in middleware — an admin token cannot access user routes and vice versa
- Refresh tokens: not implemented in V1. Admin re-logs in after 8h.

### Rate Limiting Configuration

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 login attempts per 15 min
  message: { error: 'Too many login attempts' }
});

exports.otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: { error: 'Please wait before requesting another OTP' }
});

exports.uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many uploads, please wait' }
});
```

### File Upload Validation

```javascript
// middleware/upload.js
const multer = require('multer');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const DOC_TYPES   = ['application/pdf', 'image/jpeg', 'image/png'];

function fileFilter(allowed) {
  return (req, file, cb) => {
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  };
}

exports.photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(IMAGE_TYPES)
});

exports.videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: fileFilter(VIDEO_TYPES)
});

exports.documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter(DOC_TYPES)
});
```

### Multi-tenancy Guard (never trust client-supplied agency_id)

```javascript
// WRONG — never do this:
const agencyId = req.body.agency_id; // attacker could supply any agency_id

// RIGHT — always take agency_id from the verified JWT:
const agencyId = req.admin.agency_id;

// And always AND the agency_id in every admin query:
const { rows } = await db.query(
  'SELECT * FROM candidates WHERE id = $1 AND agency_id = $2',
  [req.params.id, agencyId]
);
if (!rows[0]) return res.status(404).json({ error: 'Not found' });
// This ensures Agency A admin can never access Agency B data even with a valid JWT
```

### SQL Injection Prevention

```javascript
// WRONG — never do this:
db.query(`SELECT * FROM candidates WHERE name = '${req.body.name}'`);

// RIGHT — always use parameterized queries:
db.query('SELECT * FROM candidates WHERE name = $1', [req.body.name]);
```

### Input Validation Example

```javascript
// routes/admin/candidates.routes.js
const { body, validationResult } = require('express-validator');

const createCandidateRules = [
  body('first_name').trim().notEmpty().withMessage('First name is required').isLength({ max: 100 }),
  body('last_name').trim().notEmpty().withMessage('Last name is required').isLength({ max: 100 }),
  body('gender').optional().isIn(['male', 'female']),
  body('date_of_birth').optional().isISO8601().toDate(),
  body('years_of_experience').optional().isInt({ min: 0, max: 50 }),
  body('medical_clearance_status').optional().isIn(['pending', 'cleared', 'not_cleared']),
];

router.post('/', adminAuth, createCandidateRules, validateRequest, createCandidate);

// middleware/validator.js
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};
```

---

## 17. Screen Inventory

### Auth Screens — 6 screens
| # | Screen | Route |
|---|---|---|
| 1 | WelcomeScreen | `/welcome` |
| 2 | LoginScreen | `/login` |
| 3 | RegisterScreen | `/register` |
| 4 | OTPVerifyScreen | `/otp-verify` |
| 5 | ForgotPasswordScreen | `/forgot-password` |
| 6 | AdminLoginScreen | `/admin-login` |

### Onboarding — 1 screen
| # | Screen | Route |
|---|---|---|
| 7 | ModeSelectorScreen | `/mode-select` |

### Employer Mode Screens — 4 screens
| # | Screen | Route |
|---|---|---|
| 8 | CandidateBrowseScreen | `/employer/candidates` |
| 9 | CandidateDetailScreen | `/employer/candidates/:id` |
| 10 | SavedCandidatesScreen | `/employer/saved` |
| 11 | InquiryFormScreen | `/employer/candidates/:id/inquire` |

### Job Seeker Mode Screens — 4 screens
| # | Screen | Route |
|---|---|---|
| 12 | VacancyBrowseScreen | `/jobseeker/vacancies` |
| 13 | VacancyDetailScreen | `/jobseeker/vacancies/:id` |
| 14 | SavedVacanciesScreen | `/jobseeker/saved` |
| 15 | ApplicationFormScreen | `/jobseeker/vacancies/:id/apply` |

### Shared User Screens — 4 screens
| # | Screen | Route |
|---|---|---|
| 16 | ConversationsScreen | `/messages` |
| 17 | ChatScreen | `/messages/:conversationId` |
| 18 | NotificationsScreen | `/notifications` |
| 19 | ProfileScreen | `/profile` |

### Admin Screens — 16 screens
| # | Screen | Route |
|---|---|---|
| 20 | DashboardScreen | `/admin/dashboard` |
| 21 | CandidateListScreen | `/admin/candidates` |
| 22 | AddCandidateScreen | `/admin/candidates/add` |
| 23 | EditCandidateScreen | `/admin/candidates/:id/edit` |
| 24 | AdminCandidateDetailScreen | `/admin/candidates/:id` |
| 25 | VacancyListScreen | `/admin/vacancies` |
| 26 | AddVacancyScreen | `/admin/vacancies/add` |
| 27 | EditVacancyScreen | `/admin/vacancies/:id/edit` |
| 28 | ApplicationListScreen | `/admin/applications` |
| 29 | ApplicationDetailScreen | `/admin/applications/:id` |
| 30 | InquiryListScreen | `/admin/inquiries` |
| 31 | InquiryDetailScreen | `/admin/inquiries/:id` |
| 32 | PipelineScreen | `/admin/pipeline` |
| 33 | PipelineDetailScreen | `/admin/pipeline/:id` |
| 34 | UserListScreen | `/admin/users` |
| 35 | SettingsScreen | `/admin/settings` |

**Total: 35 screens across 7 groups**

---

## 18. Deployment Guide

### Recommended Infrastructure

| Component | Service | Why |
|---|---|---|
| API Server | AWS EC2 t3.medium OR Railway.app | Cost-effective, scalable |
| Database | AWS RDS PostgreSQL 16 | Managed, automated backups |
| Media Storage | AWS S3 + CloudFront | Purpose-built for media |
| Push Notifications | Firebase Cloud Messaging | Free, reliable, cross-platform |
| SMS | Africa's Talking | Best coverage for Ethiopian numbers |
| Process Manager | PM2 | Auto-restart on crash |
| Reverse Proxy | Nginx | SSL termination, load balancing |
| SSL | Let's Encrypt via Certbot | Free TLS certificates |

### Backend Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Clone and setup backend
git clone https://github.com/yourorg/recruitment-backend /var/www/recruitment-api
cd /var/www/recruitment-api
npm install --production
cp .env.example .env
# Edit .env with production values

# Run database migrations
node src/db/migrate.js up
psql $DATABASE_URL -f src/db/seeds/subscription_plans.sql
psql $DATABASE_URL -f src/db/seeds/categories.sql

# Start with PM2
pm2 start src/server.js --name "recruitment-api" --env production
pm2 save
pm2 startup
```

### Nginx Config (`/etc/nginx/sites-available/recruitment-api`)

```nginx
server {
    listen 80;
    server_name api.yourapp.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourapp.com;

    ssl_certificate /etc/letsencrypt/live/api.yourapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourapp.com/privkey.pem;

    client_max_body_size 110M; # For video uploads

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s; # For large file uploads
    }
}
```

### Mobile App — Production Build

**Android:**
```bash
# Generate keystore (one time)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore recruitment-release.keystore \
  -alias recruitment -keyalg RSA -keysize 2048 -validity 10000

# Build release APK / AAB
cd android
./gradlew bundleRelease        # For Google Play (.aab)
./gradlew assembleRelease      # For direct install (.apk)
```

**iOS:**
```bash
cd ios && pod install
# Build via Xcode → Product → Archive
# Or use Fastlane / EAS Build for CI
```

### Cron Jobs (PM2 Ecosystem)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'recruitment-api',
      script: 'src/server.js',
      env_production: { NODE_ENV: 'production', PORT: 5000 }
    },
    {
      name: 'recruitment-jobs',
      script: 'src/jobs/cron.js',
      env_production: { NODE_ENV: 'production' }
    }
  ]
};
```

### Cron Jobs Implementation

```javascript
// src/jobs/cron.js
const cron = require('node-cron');
const db = require('../config/db');

// Every midnight — expire vacancies past their deadline
cron.schedule('0 0 * * *', async () => {
  const { rowCount } = await db.query(`
    UPDATE job_vacancies
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
    AND application_deadline IS NOT NULL
    AND application_deadline < CURRENT_DATE
  `);
  console.log(`[CRON] Expired ${rowCount} past-deadline vacancies`);
});

// Every hour — clean expired OTPs
cron.schedule('0 * * * *', async () => {
  await db.query('DELETE FROM otp_verifications WHERE expires_at < NOW()');
  await db.query("DELETE FROM password_resets WHERE created_at < NOW() - INTERVAL '24 hours'");
});

// Every day at 2am — update view_count and inquiry_count on candidates (sync from analytics tables)
cron.schedule('0 2 * * *', async () => {
  await db.query(`
    UPDATE candidates c SET
      view_count    = (SELECT COUNT(*) FROM candidate_views v WHERE v.candidate_id = c.id),
      inquiry_count = (SELECT COUNT(*) FROM candidate_inquiries i WHERE i.candidate_id = c.id)
  `);
  await db.query(`
    UPDATE job_vacancies v SET
      view_count        = (SELECT COUNT(*) FROM vacancy_views vv WHERE vv.vacancy_id = v.id),
      application_count = (SELECT COUNT(*) FROM applications a WHERE a.vacancy_id = v.id)
  `);
  console.log('[CRON] Synced denormalized counts');
});

console.log('[CRON] Cron jobs registered');
```

---

## 19. Build Order

Build in this exact sequence. Each phase depends on the previous one being complete.

### Phase 1 — Backend Foundation (Week 1)
- [ ] Node.js + Express project scaffolding
- [ ] PostgreSQL connection pool + migration runner
- [ ] Run all 23 migrations in order
- [ ] Seed categories and subscription plans
- [ ] `POST /api/auth/register` — create user, trigger OTP
- [ ] Africa's Talking SMS setup + OTP send/verify
- [ ] `POST /api/auth/otp/verify` — verify, activate user, return JWT
- [ ] `POST /api/auth/login` — phone + password login
- [ ] `POST /api/admin/auth/login` — admin email + password login
- [ ] User auth middleware + Admin auth middleware
- [ ] Forgot password + reset password flow
- [ ] AWS S3 bucket creation + CloudFront setup
- [ ] Storage service (upload, delete, URL generation)
- [ ] Firebase Admin SDK setup + push service stub

### Phase 2 — Admin Candidate Management (Week 2)
- [ ] `POST /api/admin/candidates` — create candidate (text fields only)
- [ ] `POST /api/admin/candidates/:id/photo` — upload photo to S3
- [ ] `POST /api/admin/candidates/:id/video` — upload intro video to S3
- [ ] `POST /api/admin/candidates/:id/documents` — upload documents
- [ ] `GET /api/admin/candidates` — list with filters
- [ ] `GET /api/admin/candidates/:id` — detail with all relations
- [ ] `PUT /api/admin/candidates/:id` — update
- [ ] `PUT /api/admin/candidates/:id/medical` — update medical status
- [ ] `PUT /api/admin/candidates/:id/feature` — toggle featured
- [ ] `DELETE /api/admin/candidates/:id` — soft delete

### Phase 3 — Admin Vacancy Management (Week 2-3)
- [ ] `POST /api/admin/vacancies` — create vacancy (save as draft)
- [ ] `GET /api/admin/vacancies` — list with filters
- [ ] `GET /api/admin/vacancies/:id` — detail
- [ ] `PUT /api/admin/vacancies/:id` — update any field
- [ ] `PUT /api/admin/vacancies/:id/publish` — set active
- [ ] `PUT /api/admin/vacancies/:id/pause` — set paused
- [ ] `PUT /api/admin/vacancies/:id/close` — set closed

### Phase 4 — User Browse (Week 3)
- [ ] `GET /api/candidates` — browse with filters + pagination
- [ ] `GET /api/candidates/:id` — full detail (track view in candidate_views)
- [ ] `GET /api/vacancies` — browse with filters + pagination
- [ ] `GET /api/vacancies/:id` — full detail (track view in vacancy_views)
- [ ] `GET /api/categories` — category list

### Phase 5 — Engagement (Week 4)
- [ ] `POST /api/candidates/:id/inquiry` — submit inquiry
- [ ] `POST /api/vacancies/:id/apply` — submit application
- [ ] `GET /api/admin/inquiries` + detail + respond
- [ ] `GET /api/admin/applications` + detail + status update
- [ ] `POST /api/saved/candidates/:id` + `GET` + `DELETE`
- [ ] `POST /api/saved/vacancies/:id` + `GET` + `DELETE`
- [ ] Notification triggers: new inquiry → admin push, application status → user push

### Phase 6 — Conversations & Notifications (Week 4-5)
- [ ] `GET /api/conversations` — list threads
- [ ] `GET /api/conversations/:id/messages` — message history
- [ ] `POST /api/conversations/:id/messages` — send text
- [ ] `POST /api/conversations/:id/messages/attachment` — send file
- [ ] `GET /api/notifications` + mark read
- [ ] Admin conversations endpoint for responding from dashboard

### Phase 7 — Hiring Pipeline (Week 5)
- [ ] `POST /api/admin/pipeline` — create pipeline
- [ ] `GET /api/admin/pipeline` — list with stage filter
- [ ] `GET /api/admin/pipeline/:id` — full detail with history
- [ ] `PUT /api/admin/pipeline/:id/stage` — advance stage
- [ ] `POST /api/admin/pipeline/:id/documents` — attach documents
- [ ] `PUT /api/admin/pipeline/:id/outcome` — record outcome

### Phase 8 — Admin Dashboard & Settings (Week 6)
- [ ] `GET /api/admin/dashboard/stats`
- [ ] `GET /api/admin/dashboard/recent-activity`
- [ ] `GET/PUT /api/admin/settings`
- [ ] `CRUD /api/admin/contact-channels`
- [ ] `CRUD /api/admin/staff` (super_admin only)
- [ ] `GET/PUT/block /api/admin/users`

### Phase 9 — Mobile App (Parallel with Backend Phases 2-8)
Build screens in same order:
- [ ] AuthNavigator: Welcome, Login, Register, OTP, Mode Selector
- [ ] AdminNavigator: separate login + dashboard shell
- [ ] Admin: Add Candidate (multi-step form + media upload)
- [ ] Admin: Candidate List + Detail
- [ ] Admin: Add/Edit Vacancy
- [ ] Admin: Vacancy List
- [ ] User: Candidate Browse + Detail (with contact buttons)
- [ ] User: Vacancy Browse + Detail (with apply button)
- [ ] User: Inquiry Form + Application Form
- [ ] Admin: Applications Management
- [ ] Admin: Inquiries Management
- [ ] Conversations + Chat
- [ ] Notifications
- [ ] Admin: Pipeline (list + detail + stage advance)
- [ ] Profile screen + mode switcher
- [ ] Admin: Settings

### Phase 10 — Production Hardening (Week 7)
- [ ] Rate limiting on all auth and upload routes
- [ ] Input validation on all POST/PUT routes
- [ ] Error logging (Winston → file or CloudWatch)
- [ ] Cron jobs (expire vacancies, clean OTPs, sync counts)
- [ ] PM2 + Nginx + SSL on production server
- [ ] Firebase Cloud Messaging end-to-end test
- [ ] Africa's Talking SMS end-to-end test
- [ ] Beta test with real agency admin + 5 test users
- [ ] Load test API with realistic concurrency
- [ ] Submit to App Store + Google Play

---

*End of Documentation — v1.0*
*Total: 41 database tables · 35 screens · 60+ API endpoints · 10-week build plan*
