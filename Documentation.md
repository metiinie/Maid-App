# Ethiopian Recruitment Agency App — Comprehensive System & Build Documentation

**Version:** 3.0 (Unified Expo Architecture Edition)  
**Stack:** React Native + Expo (SDK 54) · NestJS + Fastify · Prisma + Neon PostgreSQL · Cloudinary · Redis + BullMQ · Expo Push · SMSEthiopia  
**Frontend:** Single Unified Cross-Platform Expo App (iOS · Android · Web) containing User Portals & Admin Dashboard (`app/(admin)`)  
**Infra:** Docker · Cloudflare · GitHub Actions · Sentry  
**Brand Palette:** Primary White `#FFFFFF` · Emerald Green `#10B981` · Blue `#3B82F6` · Dark Neutral `#0F172A` · Light Neutral `#F8FAFC`  
**Model:** Multi-tenant SaaS — Isolated agency workspaces, cross-platform mobile & web client.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Unified Folder Structure](#4-unified-folder-structure)
5. [Environment Variables](#5-environment-variables)
6. [Complete Database Schema (Prisma + Neon)](#6-complete-database-schema-prisma--neon)
7. [Authentication & Authorization System](#7-authentication--authorization-system)
8. [API Reference & Endpoint Inventory](#8-api-reference--endpoint-inventory)
9. [Media & Document Storage (Cloudinary)](#9-media--document-storage-cloudinary)
10. [Push Notifications (Expo Push API)](#10-push-notifications-expo-push-api)
11. [SMS & OTP Integration (SMSEthiopia)](#11-sms--otp-integration-smsethiopia)
12. [Multi-tenancy Architecture](#12-multi-tenancy-architecture)
13. [Admin Dashboard — Features & Workflows](#13-admin-dashboard--features--workflows)
14. [User App — Screens & User Flows](#14-user-app--screens--user-flows)
15. [Hiring Pipeline Engine](#15-hiring-pipeline-engine)
16. [Security & Compliance Standards](#16-security--compliance-standards)
17. [Complete Screen & Route Inventory](#17-complete-screen--route-inventory)
18. [Deployment & Infrastructure Setup](#18-deployment--infrastructure-setup)
19. [Implementation & Build Roadmap](#19-implementation--build-roadmap)
20. [Brand Identity & Design System](#20-brand-identity--design-system)

---

## 1. Project Overview

### What This Platform Does
A unified, cross-platform recruitment management application (iOS, Android, Web) that connects **Ethiopian recruitment agencies** with **Middle Eastern employers** (GCC region: Saudi Arabia, UAE, Qatar, Kuwait, Oman, Bahrain) and **Ethiopian job seekers**.

The platform provides multi-tenant agency workspaces. The recruitment agency acts as the central intermediary:
- Employers browse candidate profiles curated by verified agencies.
- Job seekers browse verified international job vacancies posted by agencies.
- All inquiries, job applications, document processing, medical clearance tracking, and visa pipelines route through agency administrators. Direct unmediated contact is disabled to ensure legal compliance and safety.

### User Roles & Access Matrix

| User Role | Credentials | Frontend Access | Scope |
|---|---|---|---|
| **Regular User (Employer Mode)** | Phone + Password (OTP Verified) | Employer candidate discovery feed, candidate detail, inquiry forms, saved candidates, direct agency contact links. | Multi-agency view |
| **Regular User (Job Seeker Mode)** | Phone + Password (OTP Verified) | Job vacancy feed, vacancy details, in-app application form, saved vacancies, application status tracker. | Multi-agency view |
| **Agency Admin / Staff** | Email + Password | Consolidated Admin Dashboard (`app/(admin)`), candidate posting & media upload, vacancy management, hiring pipeline kanban, inquiry inbox, application review. | Agency-isolated workspace |
| **Super Admin** | Email + Password | Full agency management, staff invitations, subscription oversight, workspace settings. | Agency-isolated workspace |

---

## 2. System Architecture

```
                               Cross-Platform Frontend
                     React Native + Expo SDK 54 (iOS · Android · Web)
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
  Job Seeker Portal             Employer Portal                Admin Dashboard
  `app/(tabs)/vacancies`        `app/(tabs)/candidates`       `app/(admin)/dashboard`
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        │
                                        ▼
                            NestJS + Fastify REST API
                             (API Prefix: /api/v1)
                                        │
     ┌───────────────────┬──────────────┴──────────────┬───────────────────┐
     │                   │                             │                   │
PostgreSQL (Neon)      Redis                     Cloudinary            External Services
 + Prisma ORM       + BullMQ Queues             (Media & Docs)        (SMSEthiopia / Expo Push)
```

---

## 3. Tech Stack & Dependencies

### Cross-Platform Frontend (React Native + Expo SDK 54)

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54.x | Managed workflow runtime targeting iOS, Android, and Web |
| `react-native` | 0.79.x | Core UI runtime framework |
| `expo-router` | ~4.x | File-based cross-platform routing system |
| `@tanstack/react-query` | 5.x | Server state management, data caching, background revalidation |
| `zustand` | 5.x | Client state management (Auth tokens, active user mode, filter sheets) |
| `react-hook-form` | 7.x | Form validation and state binding |
| `zod` | 3.x | Type-safe schema validation |
| `nativewind` | 4.x | Utility-first Tailwind CSS engine for React Native & Web |
| `expo-secure-store` | ~14.x | Secure device hardware key-value storage for JWTs |
| `expo-notifications` | ~0.29.x | Push notification registration and listener hooks |
| `expo-image-picker` | ~16.x | Native media capture and selection |
| `expo-video` | ~2.x | High-performance candidate video playback |
| `expo-linking` | ~7.x | Deep-linking handler for WhatsApp, Telegram, IMO, phone calls |
| `lucide-react-native` | 0.x | Modern icon set |

### Backend (NestJS 11 + Fastify)

| Package | Version | Purpose |
|---|---|---|
| `@nestjs/core` | 11.x | Core framework container |
| `@nestjs/platform-fastify` | 11.x | Fastify adapter for high throughput |
| `@nestjs/swagger` | 8.x | Auto-generated OpenAPI / Swagger documentation |
| `@prisma/client` | 6.x | Type-safe ORM for PostgreSQL |
| `@nestjs/jwt` | 11.x | Standardized JSON Web Token creation & verification |
| `@nestjs/passport` | 11.x | Authentication strategy integration (User Strategy vs Admin Strategy) |
| `@nestjs/bullmq` | 11.x | Redis-backed asynchronous queue for background jobs |
| `@nestjs/throttler` | 6.x | Rate limiting guard |
| `cloudinary` | 2.x | Cloudinary SDK for images, candidate intro videos, and PDFs |
| `expo-server-sdk` | 3.x | Expo Push Notification delivery client |
| `bcryptjs` | 2.x | Password hashing |
| `class-validator` | 0.14.x | DTO request payload validation |
| `@sentry/nestjs` | 9.x | Application performance monitoring & crash reporting |

### Cloud Services & Infrastructure

| Service | Category | Technical Role |
|---|---|---|
| **Neon** | Database | Serverless PostgreSQL with branch support and auto-scaling connection pooling. |
| **Cloudinary** | Media CDN | Image optimization, automated video transcoding (HLS/MP4), thumbnail generation, document store. |
| **SMSEthiopia** | Telecom Gateway | Localized Ethiopian SMS delivery for OTP phone verification and status updates. |
| **Expo Push Service** | Push Gateway | Unified APNs (iOS) & FCM (Android) push notification delivery. |
| **Upstash / Cloud Redis**| Cache & Queue | Session cache, BullMQ queue engine, rate-limit storage. |

---

## 4. Unified Folder Structure

### Consolidated Project Layout

```
Maid-App/
├── Documentation.md                   # Complete architectural specification (this file)
│
├── backend/                           # NestJS + Fastify REST API backend
│   ├── prisma/
│   │   ├── schema.prisma              # Production database schema (18 models)
│   │   └── seed.ts                    # Initial database seeder script
│   ├── src/
│   │   ├── main.ts                    # Bootstrap entry point (Fastify + Swagger)
│   │   ├── app.module.ts              # Root NestJS module import tree
│   │   ├── common/                    # Guards, Interceptors, Filters, Decorators
│   │   │   ├── decorators/            # @CurrentUser(), @CurrentAdmin(), @Roles()
│   │   │   ├── guards/                # UserJwtGuard, AdminJwtGuard, RolesGuard, AgencyGuard
│   │   │   └── filters/               # HttpExceptionFilter, PrismaExceptionFilter
│   │   ├── media/                     # Cloudinary upload service
│   │   ├── sms/                       # SMSEthiopia provider service
│   │   ├── notifications/             # Expo Push Notification service & controller
│   │   └── modules/                   # 15 domain feature modules
│   │       ├── auth/                  # Phone OTP & password authentication
│   │       ├── admin-auth/            # Separate Admin login strategy
│   │       ├── users/                 # User profiles & mode switcher
│   │       ├── candidates/            # Candidate profiles & public search
│   │       ├── admin-candidates/      # Admin candidate management & media
│   │       ├── vacancies/             # Job vacancy listings
│   │       ├── admin-vacancies/        # Admin job vacancy controls
│   │       ├── applications/          # Job applications
│   │       ├── inquiries/             # Employer candidate inquiries
│   │       ├── saved/                 # Bookmarks (candidates & vacancies)
│   │       ├── conversations/         # Messaging & live chat
│   │       ├── pipeline/              # 5-stage hiring pipeline
│   │       ├── staff/                 # Agency staff management
│   │       ├── settings/              # Workspace contact channels & toggles
│   │       └── jobs/                  # BullMQ processors (expiry, OTP cleanup)
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                          # Unified Expo (SDK 54) App
    ├── app/                           # File-based router tree
    │   ├── _layout.tsx                # Root layout provider (QueryClient, AuthProvider)
    │   ├── (auth)/                    # Auth screens (welcome, login, register, otp)
    │   ├── (tabs)/                    # Main bottom navigation tabs
    │   │   ├── index.tsx              # Dynamic home (Employer or Job Seeker feed)
    │   │   ├── candidates.tsx         # Employer candidate discovery
    │   │   ├── vacancies.tsx          # Job seeker vacancy search
    │   │   ├── agencies.tsx           # Verified agency directory
    │   │   ├── saved.tsx              # Bookmarked items
    │   │   ├── messages.tsx           # Live messaging threads
    │   │   ├── notifications.tsx      # Notification inbox
    │   │   └── profile.tsx            # User profile & mode switcher
    │   ├── (admin)/                   # Integrated Agency Admin Dashboard
    │   │   ├── dashboard.tsx          # Executive metrics & quick actions
    │   │   ├── candidates.tsx         # Candidate list & photo/video uploader
    │   │   ├── vacancies.tsx          # Job posting manager
    │   │   ├── applications.tsx       # Applications review board
    │   │   ├── inquiries.tsx          # Employer inquiry inbox
    │   │   ├── pipeline.tsx           # Visual 5-stage Hiring Kanban board
    │   │   ├── staff.tsx              # Staff management
    │   │   └── settings.tsx           # Channel & agency settings
    │   ├── candidate/
    │   │   └── [id].tsx               # Candidate detail profile & video view
    │   └── vacancy/
    │       └── [id].tsx               # Job vacancy detail view
    ├── context/                       # React contexts (AuthContext, ChatContext)
    ├── services/                      # Axios API client services
    ├── store/                         # Zustand stores (auth.store.ts, ui.store.ts)
    ├── components/                    # UI elements & cards
    ├── global.css                     # NativeWind Tailwind styles
    ├── app.json                       # Expo configuration
    └── package.json
```

---

## 5. Environment Variables

### Backend `.env`

```env
NODE_ENV=development
PORT=5000
API_PREFIX=api/v1

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-cool-name.us-east-2.aws.neon.tech/recruitment_db?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-cool-name.us-east-2.aws.neon.tech/recruitment_db?sslmode=require"

# Redis & BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Dual JWT Secrets
JWT_SECRET=super_secret_user_jwt_key_32_chars_min
JWT_EXPIRES_IN=30d
ADMIN_JWT_SECRET=super_secret_admin_jwt_key_32_chars_min
ADMIN_JWT_EXPIRES_IN=8h

# Media Cloud Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Telecom & Push Gateways
SMS_ETHIOPIA_API_KEY=your_smsethiopia_api_key
SMS_ETHIOPIA_SENDER_ID=AGENCY
EXPO_ACCESS_TOKEN=your_expo_access_token

# Observability
SENTRY_DSN=https://xxxxxx@sentry.io/xxxxxx
ALLOWED_ORIGINS=http://localhost:8081,https://admin.youragency.com
```

### Frontend `.env` (Expo Environment)

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

---

## 6. Complete Database Schema (Prisma + Neon)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  ADMIN
  STAFF
}

enum PreferredMode {
  JOB_SEEKER
  EMPLOYER
}

enum VacancyStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
  EXPIRED
}

enum ApplicationStatus {
  SUBMITTED
  UNDER_REVIEW
  SHORTLISTED
  SELECTED
  REJECTED
}

enum InquiryStatus {
  NEW
  READ
  RESPONDED
  CLOSED
}

enum PipelineStage {
  INTERVIEWING
  MEDICAL_BIOMETRICS
  VISA_PROCESSING
  PRE_DEPARTURE_TRAINING
  DEPLOYED
  CANCELLED
}

// ------------------------------------------------------
// Core Workspace & Tenancy
// ------------------------------------------------------

model Agency {
  id               String                 @id @default(uuid())
  name             String
  licenseNumber    String?                @map("license_number")
  logoUrl          String?                @map("logo_url")
  bannerUrl        String?                @map("banner_url")
  phone            String?
  email            String?
  city             String?
  address          String?
  isActive         Boolean                @default(true) @map("is_active")
  createdAt        DateTime               @default(now()) @map("created_at")
  updatedAt        DateTime               @updatedAt @map("updated_at")

  adminUsers       AdminUser[]
  candidates       Candidate[]
  vacancies        JobVacancy[]
  hiringPipelines  HiringPipeline[]
  conversations    Conversation[]
  contactChannels  AgencyContactChannel[]
  settings         AgencySetting?

  @@map("agencies")
}

model AgencyContactChannel {
  id           String   @id @default(uuid())
  agencyId     String   @map("agency_id")
  channelType  String   @map("channel_type") // whatsapp, telegram, imo, phone, email
  channelValue String   @map("channel_value")
  label        String?
  isPrimary    Boolean  @default(false) @map("is_primary")
  createdAt    DateTime @default(now()) @map("created_at")

  agency       Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)

  @@map("agency_contact_channels")
}

model AgencySetting {
  id                      String   @id @default(uuid())
  agencyId                String   @unique @map("agency_id")
  allowInAppApplications  Boolean  @default(true) @map("allow_in_app_applications")
  showSalaryInVacancies   Boolean  @default(true) @map("show_salary_in_vacancies")
  notifyAdminOnNewInquiry Boolean  @default(true) @map("notify_admin_on_new_inquiry")
  updatedAt               DateTime @updatedAt @map("updated_at")

  agency                  Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)

  @@map("agency_settings")
}

model AdminUser {
  id        String   @id @default(uuid())
  agencyId  String   @map("agency_id")
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  email     String   @unique
  password  String
  role      Role     @default(ADMIN)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  agency    Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)

  @@map("admin_users")
}

// ------------------------------------------------------
// Mobile App Users & Profiles
// ------------------------------------------------------

model User {
  id            String            @id @default(uuid())
  firstName     String            @map("first_name")
  lastName      String            @map("last_name")
  phone         String            @unique
  email         String?           @unique
  password      String
  preferredMode PreferredMode     @default(JOB_SEEKER) @map("preferred_mode")
  profilePhoto  String?           @map("profile_photo")
  phoneVerified Boolean           @default(false) @map("phone_verified")
  isActive      Boolean           @default(true) @map("is_active")
  createdAt     DateTime          @default(now()) @map("created_at")
  updatedAt     DateTime          @updatedAt @map("updated_at")

  jobseekerProfile JobseekerProfile?
  employerProfile  EmployerProfile?
  deviceTokens     DeviceToken[]
  applications     Application[]
  inquiries        CandidateInquiry[]
  conversations    Conversation[]
  notifications    Notification[]
  savedCandidates  SavedCandidate[]
  savedVacancies   SavedVacancy[]

  @@map("users")
}

model JobseekerProfile {
  id                           String   @id @default(uuid())
  userId                       String   @unique @map("user_id")
  bio                          String?
  currentCountry               String?  @default("Ethiopia") @map("current_country")
  city                         String?
  educationLevel               String?  @map("education_level")
  yearsOfExperience            Int      @default(0) @map("years_of_experience")
  hasOverseasExperience        Boolean  @default(false) @map("has_overseas_experience")
  preferredDestinationCountries String[] @map("preferred_destination_countries")
  availabilityDate             DateTime? @map("availability_date")
  skills                       Json?    // [{ skill_name, proficiency_level }]
  languages                    Json?    // [{ language, proficiency }]
  updatedAt                    DateTime @updatedAt @map("updated_at")

  user                         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("jobseeker_profiles")
}

model EmployerProfile {
  id          String   @id @default(uuid())
  userId      String   @unique @map("user_id")
  companyName String?  @map("company_name")
  companyType String   @default("individual_family") @map("company_type") // individual_family | corporate
  country     String?
  city        String?
  updatedAt   DateTime @updatedAt @map("updated_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("employer_profiles")
}

model DeviceToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  platform  String   @default("expo")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("device_tokens")
}

model OtpVerification {
  id        String   @id @default(uuid())
  phone     String
  code      String
  purpose   String   // registration | password_reset | login
  expiresAt DateTime @map("expires_at")
  verified  Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("otp_verifications")
}

// ------------------------------------------------------
// Domain 1: Candidates
// ------------------------------------------------------

model Category {
  id          String       @id @default(uuid())
  name        String       @unique
  description String?
  icon        String?
  createdAt   DateTime     @default(now()) @map("created_at")

  candidates  Candidate[]
  vacancies   JobVacancy[]

  @@map("categories")
}

model Candidate {
  id                   String             @id @default(uuid())
  agencyId             String             @map("agency_id")
  categoryId           String             @map("category_id")
  firstName            String             @map("first_name")
  lastName             String             @map("last_name")
  dateOfBirth          DateTime?          @map("date_of_birth")
  gender               String             @default("female")
  nationality          String             @default("Ethiopian")
  religion             String?
  maritalStatus        String?            @map("marital_status")
  currentCountry       String             @default("Ethiopia") @map("current_country")
  city                 String?
  summary              String?
  educationLevel       String?            @map("education_level")
  yearsOfExperience    Int                @default(0) @map("years_of_experience")
  medicalStatus        String             @default("pending") @map("medical_status")
  medicalClearanceDate DateTime?          @map("medical_clearance_date")
  medicalExpiryDate    DateTime?          @map("medical_expiry_date")
  visaStatus           String             @default("no_visa") @map("visa_status")
  availabilityDate     DateTime?          @map("availability_date")
  photoUrl             String?            @map("photo_url")
  videoUrl             String?            @map("video_url")
  videoThumbnail       String?            @map("video_thumbnail")
  isFeatured           Boolean            @default(false) @map("is_featured")
  isAvailable          Boolean            @default(true) @map("is_available")
  skills               String[]
  languages            String[]
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")

  agency               Agency             @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  category             Category           @relation(fields: [categoryId], references: [id])
  inquiries            CandidateInquiry[]
  hiringPipelines      HiringPipeline[]
  savedCandidates      SavedCandidate[]
  documents            CandidateDocument[]
  views                CandidateView[]

  @@map("candidates")
}

model CandidateDocument {
  id           String    @id @default(uuid())
  candidateId  String    @map("candidate_id")
  documentType String    @map("document_type") // passport, medical, coc, contract
  fileUrl      String    @map("file_url")
  expiryDate   DateTime? @map("expiry_date")
  createdAt    DateTime  @default(now()) @map("created_at")

  candidate    Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@map("candidate_documents")
}

model CandidateView {
  id          String    @id @default(uuid())
  candidateId String    @map("candidate_id")
  viewedAt    DateTime  @default(now()) @map("viewed_at")

  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@map("candidate_views")
}

// ------------------------------------------------------
// Domain 2: Job Vacancies
// ------------------------------------------------------

model JobVacancy {
  id                    String        @id @default(uuid())
  agencyId              String        @map("agency_id")
  categoryId            String        @map("category_id")
  title                 String
  description           String
  requirements          String[]
  country               String
  city                  String?
  employerType          String        @default("individual_family") @map("employer_type")
  employerName          String?       @map("employer_name")
  showEmployerName      Boolean       @default(false) @map("show_employer_name")
  salaryMin             Int           @map("salary_min")
  salaryMax             Int           @map("salary_max")
  salaryCurrency        String        @default("USD") @map("salary_currency")
  contractPeriodYears   Int           @default(2) @map("contract_period_years")
  workingHoursPerDay    Int           @default(8) @map("working_hours_per_day")
  workingDaysPerWeek    Int           @default(6) @map("working_days_per_week")
  visaSponsorship       Boolean       @default(true) @map("visa_sponsorship")
  accommodationProvided Boolean       @default(true) @map("accommodation_provided")
  mealsProvided         Boolean       @default(true) @map("meals_provided")
  transportationProvided Boolean      @default(false) @map("transportation_provided")
  healthInsurance       Boolean       @default(true) @map("health_insurance")
  annualLeaveDays       Int           @default(30) @map("annual_leave_days")
  genderPreference      String        @default("any") @map("gender_preference")
  ageMin                Int?          @map("age_min")
  ageMax                Int?          @map("age_max")
  experienceRequired    Int           @default(0) @map("experience_required")
  vacanciesCount        Int           @default(1) @map("vacancies_count")
  applicationDeadline   DateTime?     @map("application_deadline")
  status                VacancyStatus @default(DRAFT)
  publishedAt           DateTime?     @map("published_at")
  createdAt             DateTime      @default(now()) @map("created_at")
  updatedAt             DateTime      @updatedAt @map("updated_at")

  agency                Agency        @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  category              Category      @relation(fields: [categoryId], references: [id])
  applications          Application[]
  savedVacancies        SavedVacancy[]
  views                 VacancyView[]

  @@map("job_vacancies")
}

model VacancyView {
  id        String     @id @default(uuid())
  vacancyId String     @map("vacancy_id")
  viewedAt  DateTime   @default(now()) @map("viewed_at")

  vacancy   JobVacancy @relation(fields: [vacancyId], references: [id], onDelete: Cascade)

  @@map("vacancy_views")
}

// ------------------------------------------------------
// Domain 3: Applications & Inquiries
// ------------------------------------------------------

model Application {
  id              String            @id @default(uuid())
  vacancyId       String            @map("vacancy_id")
  userId          String            @map("user_id")
  status          ApplicationStatus @default(SUBMITTED)
  coverLetter     String?           @map("cover_letter")
  additionalNotes String?           @map("additional_notes")
  reviewerNotes   String?           @map("reviewer_notes")
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  vacancy         JobVacancy        @relation(fields: [vacancyId], references: [id], onDelete: Cascade)
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("applications")
}

model CandidateInquiry {
  id                      String        @id @default(uuid())
  candidateId             String        @map("candidate_id")
  userId                  String        @map("user_id")
  message                 String
  preferredContactChannel String        @default("whatsapp") @map("preferred_contact_channel")
  purpose                 String?
  requiredStartDate       DateTime?     @map("required_start_date")
  status                  InquiryStatus @default(NEW)
  adminResponse           String?       @map("admin_response")
  createdAt               DateTime      @default(now()) @map("created_at")
  updatedAt               DateTime      @updatedAt @map("updated_at")

  candidate               Candidate     @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  user                    User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("candidate_inquiries")
}

// ------------------------------------------------------
// Domain 4: Saved Bookmarks
// ------------------------------------------------------

model SavedCandidate {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  candidateId String    @map("candidate_id")
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@unique([userId, candidateId])
  @@map("saved_candidates")
}

model SavedVacancy {
  id        String     @id @default(uuid())
  userId    String     @map("user_id")
  vacancyId String     @map("vacancy_id")
  createdAt DateTime   @default(now()) @map("created_at")

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  vacancy   JobVacancy @relation(fields: [vacancyId], references: [id], onDelete: Cascade)

  @@unique([userId, vacancyId])
  @@map("saved_vacancies")
}

// ------------------------------------------------------
// Domain 5: Hiring Pipeline & History
// ------------------------------------------------------

model HiringPipeline {
  id                     String                 @id @default(uuid())
  agencyId               String                 @map("agency_id")
  candidateId            String                 @map("candidate_id")
  employerName           String                 @map("employer_name")
  employerCountry        String                 @map("employer_country")
  employerCity           String?                @map("employer_city")
  employerContact        String?                @map("employer_contact")
  currentStage           PipelineStage          @default(INTERVIEWING) @map("current_stage")
  isActive               Boolean                @default(true) @map("is_active")
  notes                  String?
  expectedDeploymentDate DateTime?              @map("expected_deployment_date")
  actualDeploymentDate   DateTime?              @map("actual_deployment_date")
  outcome                String?                // successful, cancelled, candidate_withdrew
  outcomeNotes           String?                @map("outcome_notes")
  createdAt              DateTime               @default(now()) @map("created_at")
  updatedAt              DateTime               @updatedAt @map("updated_at")

  agency                 Agency                 @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  candidate              Candidate              @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  stageHistory           PipelineStageHistory[]
  pipelineDocuments      PipelineDocument[]

  @@map("hiring_pipelines")
}

model PipelineStageHistory {
  id           String        @id @default(uuid())
  pipelineId   String        @map("pipeline_id")
  stage        PipelineStage
  enteredAt    DateTime      @default(now()) @map("entered_at")
  exitedAt     DateTime?     @map("exited_at")
  durationDays Int?          @map("duration_days")
  notes        String?
  updatedBy    String?       @map("updated_by")

  pipeline     HiringPipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)

  @@map("pipeline_stage_histories")
}

model PipelineDocument {
  id           String         @id @default(uuid())
  pipelineId   String         @map("pipeline_id")
  documentType String         @map("document_type") // offer_letter, contract, medical_report, visa, ticket
  fileUrl      String         @map("file_url")
  notes        String?
  uploadedAt   DateTime       @default(now()) @map("uploaded_at")

  pipeline     HiringPipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)

  @@map("pipeline_documents")
}

// ------------------------------------------------------
// Domain 6: Conversations & Messaging
// ------------------------------------------------------

model Conversation {
  id        String    @id @default(uuid())
  agencyId  String    @map("agency_id")
  userId    String    @map("user_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  agency    Agency    @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]

  @@map("conversations")
}

model Message {
  id             String       @id @default(uuid())
  conversationId String       @map("conversation_id")
  senderType     String       @map("sender_type") // 'user' | 'agency'
  senderId       String       @map("sender_id")
  text           String
  attachmentUrl  String?      @map("attachment_url")
  createdAt      DateTime     @default(now()) @map("created_at")

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@map("messages")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  title     String
  body      String
  data      Json?
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

---

## 7. Authentication & Authorization System

### Token Separation & Security Strategy

The application issues two non-interchangeable JWT tokens signed with distinct secrets:

1. **User JWT Token** (`JWT_SECRET`, 30-day expiry):
   - Payload: `{ sub: "user-id", type: "user", mode: "job_seeker" | "employer" }`
   - Enforced by `UserJwtGuard`.
2. **Admin JWT Token** (`ADMIN_JWT_SECRET`, 8-hour expiry):
   - Payload: `{ sub: "admin-id", type: "admin", role: "SUPER_ADMIN" | "ADMIN" | "STAFF", agency_id: "agency-id" }`
   - Enforced by `AdminJwtGuard` + `AgencyGuard`.

### Registration & Verification Workflow
1. `POST /api/v1/auth/register` → Creates inactive user record, triggers OTP via `SMSEthiopiaService`.
2. `POST /api/v1/auth/otp/verify` → Validates 6-digit OTP from `otp_verifications`, marks `phone_verified = true`, returns User JWT.
3. User selects mode via `PUT /api/v1/auth/mode`.

---

## 8. API Reference & Endpoint Inventory

**Base URL:** `http://localhost:5000/api/v1`  
**Authentication:** `Authorization: Bearer <JWT>`

### Complete Route Table

| Category | Endpoint | Method | Guard | Description |
|---|---|---|---|---|
| **Auth** | `/auth/register` | `POST` | Public | Register new user account |
| **Auth** | `/auth/login` | `POST` | Public | Login with phone & password |
| **Auth** | `/auth/otp/send` | `POST` | Public | Dispatch OTP via SMSEthiopia |
| **Auth** | `/auth/otp/verify` | `POST` | Public | Verify phone OTP |
| **Auth** | `/auth/mode` | `PUT` | UserJwt | Switch mode (`job_seeker` / `employer`) |
| **Admin Auth** | `/admin/auth/login` | `POST` | Public | Agency admin authentication |
| **User Profile**| `/users/me` | `GET` | UserJwt | Fetch current user & both profiles |
| **User Profile**| `/users/me/jobseeker-profile` | `PUT` | UserJwt | Update job seeker attributes |
| **User Profile**| `/users/me/employer-profile` | `PUT` | UserJwt | Update employer attributes |
| **User Profile**| `/users/me/device-token` | `PUT` | UserJwt | Register Expo Push Token |
| **Candidates** | `/candidates` | `GET` | UserJwt | Browse & search candidates |
| **Candidates** | `/candidates/:id` | `GET` | UserJwt | View candidate detail |
| **Candidates** | `/candidates/:id/inquiry` | `POST` | UserJwt | Submit employer candidate inquiry |
| **Admin Cand.** | `/admin/candidates` | `GET/POST` | AdminJwt | List agency candidates / Create profile |
| **Admin Cand.** | `/admin/candidates/:id/photo` | `POST` | AdminJwt | Upload photo (Cloudinary) |
| **Admin Cand.** | `/admin/candidates/:id/video` | `POST` | AdminJwt | Upload intro video (Cloudinary) |
| **Admin Cand.** | `/admin/candidates/:id/medical`| `PUT` | AdminJwt | Update medical clearance status |
| **Vacancies** | `/vacancies` | `GET` | UserJwt | Browse & filter job vacancies |
| **Vacancies** | `/vacancies/:id` | `GET` | UserJwt | View job vacancy detail |
| **Vacancies** | `/vacancies/:id/apply` | `POST` | UserJwt | Apply for job vacancy |
| **Admin Vac.** | `/admin/vacancies` | `GET/POST` | AdminJwt | List agency vacancies / Create vacancy |
| **Admin Vac.** | `/admin/vacancies/:id/publish` | `PUT` | AdminJwt | Publish draft vacancy |
| **Applications**| `/admin/applications` | `GET` | AdminJwt | List received job applications |
| **Applications**| `/admin/applications/:id/status`| `PUT` | AdminJwt | Update application review status |
| **Inquiries** | `/admin/inquiries` | `GET` | AdminJwt | View employer inquiry inbox |
| **Inquiries** | `/admin/inquiries/:id/respond` | `PUT` | AdminJwt | Submit response to employer |
| **Saved Items** | `/saved/candidates` | `GET/POST/DEL` | UserJwt | Bookmark candidate profiles |
| **Saved Items** | `/saved/vacancies` | `GET/POST/DEL` | UserJwt | Bookmark job vacancies |
| **Pipeline** | `/admin/pipeline` | `GET/POST` | AdminJwt | List active pipelines / Start candidate pipeline |
| **Pipeline** | `/admin/pipeline/:id/stage` | `PUT` | AdminJwt | Advance 5-stage pipeline stage |
| **Staff** | `/admin/staff` | `GET/POST` | AdminJwt (Super) | Manage agency staff accounts |
| **Settings** | `/admin/settings/channels` | `GET/POST` | AdminJwt | Manage agency contact channels |

---

## 9. Media & Document Storage (Cloudinary)

Cloudinary handles all file uploads. Storage folders follow agency isolation:

```
Cloudinary Account/
├── agencies/{agency_id}/logos/
├── candidates/{agency_id}/{candidate_id}/
│   ├── photos/        # Profile photos (auto-face crop)
│   ├── videos/        # Candidate intro clips (MP4/HLS + thumbnail generation)
│   └── documents/     # Passports, medical certs (PDF)
└── pipeline/{agency_id}/{pipeline_id}/ # Visa & contract PDFs
```

---

## 10. Push Notifications (Expo Push API)

Backend uses `expo-server-sdk` to send push notifications to user devices.

### Notification Event Matrix
- **Application Submitted**: Alert sent to Agency Admins.
- **Application Status Changed**: Push notification sent to applicant ("Your application for Housemaid was Shortlisted").
- **New Candidate Inquiry**: Alert sent to Agency Admins.
- **Inquiry Responded**: Alert sent to Employer.
- **Pipeline Stage Advanced**: Alert sent to Candidate ("Your visa processing is complete!").

---

## 11. SMS & OTP Integration (SMSEthiopia)

The backend `SmsEthiopiaService` interacts with SMSEthiopia HTTP API:
- Dispatches 6-digit OTP codes for user registration and password resets.
- Formats messages in Amharic / English depending on recipient preference.

---

## 12. Multi-tenancy Architecture

1. **Isolation Key**: Every candidate, vacancy, pipeline, inquiry, and admin user is bound to an `agency_id`.
2. **Middleware Guard**: `AgencyGuard` extracts `agency_id` from verified Admin JWT payload and injects `req.agencyId`.
3. **Query Safety**: All admin SQL/Prisma operations force `where: { agencyId: req.agencyId }`.

---

## 13. Admin Dashboard — Features & Workflows

Integrated directly inside Expo at `app/(admin)/`:
- **Executive Metrics Screen**: Candidate counts, active vacancy counts, pending applications count, unread inquiry count.
- **Candidate Uploader & Media Hub**: Multi-step candidate registration, direct photo capture, intro video uploader.
- **Interactive Hiring Pipeline Kanban**: 5-stage board (`interviewing` → `medical_biometrics` → `visa_processing` → `pre_departure_training` → `deployed`).
- **Inquiry & Application Center**: Inbox with one-tap WhatsApp / Telegram launch triggers.

---

## 14. User App — Screens & User Flows

1. **Dual-Mode Feed System**:
   - Switching mode in `ProfileScreen` toggles tab content instantly.
   - **Employer Mode**: Discovery feed of candidates with skill chips, experience tags, medical clearance badges, and direct contact buttons.
   - **Job Seeker Mode**: International vacancy feed with flag indicators, salary range, contract terms, and benefit badges.
2. **Deep-Link Contact Actions**:
   - One-tap WhatsApp (`https://wa.me/...`), Telegram (`https://t.me/...`), IMO (`imo://...`), and direct phone call triggers routing to agency contact channels.

---

## 15. Hiring Pipeline Engine

Five strictly ordered progression stages:
1. `interviewing` (Initial candidate screening)
2. `medical_biometrics` (GAMCA / E-health medical clearance)
3. `visa_processing` (Embassy visa issue & endorsement)
4. `pre_departure_training` (Mandatory labor agency orientation)
5. `deployed` (Flight ticket issued & arrival at host employer)

Every stage update logs an entry into `PipelineStageHistory` with calculated `duration_days`.

---

## 16. Security & Compliance Standards

- **Dual Secret Isolation**: User tokens cannot access Admin endpoints; Admin tokens cannot access User endpoints.
- **Password Hashing**: Bcrypt salt rounds set to 12.
- **Rate Limiting**: Throttler module enforces maximum 10 auth attempts per 15-minute window.
- **Media Protection**: Document PDFs stored in private signed URLs.

---

## 17. Complete Screen & Route Inventory

| # | Screen Name | Expo Router Route | Target User |
|---|---|---|---|
| 1 | Welcome Screen | `/welcome` | Auth |
| 2 | User Login | `/login` | Auth |
| 3 | User Register | `/register` | Auth |
| 4 | OTP Verification | `/otp-verify` | Auth |
| 5 | Mode Selector | `/mode-select` | Onboarding |
| 6 | Candidate Feed | `/(tabs)/candidates` | Employer |
| 7 | Candidate Detail | `/candidate/[id]` | Employer |
| 8 | Inquiry Form | `/candidate/[id]/inquire` | Employer |
| 9 | Vacancy Feed | `/(tabs)/vacancies` | Job Seeker |
| 10 | Vacancy Detail | `/vacancy/[id]` | Job Seeker |
| 11 | Application Form | `/vacancy/[id]/apply` | Job Seeker |
| 12 | Saved Bookmarks | `/(tabs)/saved` | All Users |
| 13 | Conversations List| `/(tabs)/messages` | All Users |
| 14 | Chat Screen | `/messages/[id]` | All Users |
| 15 | Notifications | `/(tabs)/notifications` | All Users |
| 16 | Profile & Settings | `/(tabs)/profile` | All Users |
| 17 | Admin Dashboard | `/(admin)/dashboard` | Agency Admin |
| 18 | Admin Candidates | `/(admin)/candidates` | Agency Admin |
| 19 | Admin Add Candidate| `/(admin)/candidates/add` | Agency Admin |
| 20 | Admin Vacancies | `/(admin)/vacancies` | Agency Admin |
| 21 | Admin Add Vacancy | `/(admin)/vacancies/add` | Agency Admin |
| 22 | Admin Applications| `/(admin)/applications` | Agency Admin |
| 23 | Admin Inquiries | `/(admin)/inquiries` | Agency Admin |
| 24 | Admin Pipeline | `/(admin)/pipeline` | Agency Admin |
| 25 | Admin Settings | `/(admin)/settings` | Agency Admin |

---

## 18. Deployment & Infrastructure Setup

```dockerfile
# Production Multi-Stage Dockerfile for NestJS API
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json prisma ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000
CMD ["node", "dist/main.js"]
```

---

## 19. Implementation & Build Roadmap

- [x] **Phase 1: Architecture Consolidation & Documentation v3.0** (Completed)
- [ ] **Phase 2: Database Schema Migration** (Run Prisma migration on Neon to apply all 18 production models).
- [ ] **Phase 3: Backend Modules Implementation** (Build missing controllers for Users, Vacancies, Applications, Inquiries, Pipeline, Saved Items, Conversations, Staff, Settings).
- [ ] **Phase 4: Expo Frontend Route Completion** (Build remaining screens for candidate detail, vacancy detail, saved tab, live chat, notifications, and Admin visual pipeline).
- [ ] **Phase 5: End-to-End QA & Deployment** (Perform mobile cross-platform testing, verify SMSEthiopia & Cloudinary triggers, launch API container).

---

## 20. Brand Identity & Design System

| Token | Color Code | Purpose |
|---|---|---|
| **Primary White** | `#FFFFFF` | Card containers, crisp headers, high contrast canvas |
| **Brand Emerald Green** | `#10B981` | Action CTAs, success badges, cleared medical status |
| **Brand Blue** | `#3B82F6` | Navigation accents, candidate category chips, information banners |
| **Dark Slate** | `#0F172A` | Typography text, dark mode container fills |
| **Light Slate** | `#F8FAFC` | Input field backgrounds, table row borders |

---

*End of Specification — Ethiopian Recruitment Agency App v3.0*
