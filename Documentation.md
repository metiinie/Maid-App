# Ethiopian Recruitment Agency App — Full Build Documentation

**Version:** 2.0  
**Stack:** React Native + Expo · NestJS + Fastify · Prisma + Neon PostgreSQL · Cloudinary · Redis + BullMQ · Expo Push · SMSEthiopia  
**Admin:** Next.js + Tailwind + shadcn/ui  
**Infra:** Docker · Cloudflare · GitHub Actions · Sentry  
**Brand Colors:** White `#FFFFFF` · Green `#10B981` · Blue `#3B82F6`  
**Model:** Multi-tenant SaaS — one mobile app, one admin dashboard, multiple agency workspaces

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
                       React Native + Expo (SDK 54)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                 Android           iOS             Web
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
               Single Unified Cross-Platform Frontend
       (Job Seeker Portal · Employer Portal · Admin Dashboard)
                                    │
                                    ▼
                             NestJS + Fastify
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            PostgreSQL (Neon)                    Redis
                + Prisma                        + BullMQ
```

### Request Flow

1. Cross-platform frontend (Android, iOS, Web) sends requests with `Authorization: Bearer <JWT>`
2. NestJS `AuthGuard` verifies token, extracts `userId` or `adminId` + `role`
3. `AgencyGuard` resolves `agency_id` from the JWT payload
4. Controller delegates to service layer which uses Prisma Client for database operations
5. For file uploads: files are uploaded to Cloudinary; the returned URL is stored in the DB
6. For notifications: notification service calls Expo Push API and/or SMSEthiopia after the primary DB write
7. Background jobs (email, analytics sync, vacancy expiration) are queued via BullMQ + Redis

---

## 3. Tech Stack & Versions

### Cross-Platform Frontend (React Native + Expo for Android, iOS, Web)

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54.x | Managed workflow platform targeting Android, iOS, and Web |
| `react-native` | 0.79.x | Core framework |
| `expo-router` | ~4.x | File-based cross-platform routing |
| `@react-navigation/bottom-tabs` | 7.x | Tab navigator |
| `@tanstack/react-query` | 5.x | Server state management (caching, refetching, mutations) |
| `zustand` | 5.x | Client state management (auth, mode, UI state) |
| `react-hook-form` | 7.x | Form management |
| `zod` | 3.x | Schema validation |
| `@hookform/resolvers` | 3.x | Zod resolver for React Hook Form |
| `axios` | 1.x | HTTP client (used by TanStack Query) |
| `nativewind` | 4.x | Utility-first Tailwind CSS styling for React Native & Web |
| `expo-secure-store` | ~14.x | Secure token storage |
| `expo-notifications` | ~0.29.x | Expo Push Notifications |
| `expo-image-picker` | ~16.x | Photo/video capture and selection |
| `expo-document-picker` | ~13.x | Document upload |
| `expo-video` | ~2.x | Candidate intro video playback |
| `expo-linking` | ~7.x | WhatsApp/Telegram/IMO deep links |
| `expo-image` | ~2.x | Cached image display |
| `lucide-react-native` | 0.x | Cross-platform icon library |

### Backend (NestJS + Fastify)

| Package | Version | Purpose |
|---|---|---|
| `@nestjs/core` | 11.x | NestJS framework core |
| `@nestjs/platform-fastify` | 11.x | Fastify HTTP adapter (high performance) |
| `@nestjs/swagger` | 8.x | OpenAPI / Swagger documentation |
| `@nestjs/config` | 4.x | Environment configuration |
| `@nestjs/jwt` | 11.x | JWT creation and verification |
| `@nestjs/passport` | 11.x | Auth strategy framework |
| `@nestjs/bullmq` | 11.x | Background job queue |
| `@nestjs/throttler` | 6.x | Rate limiting |
| `@prisma/client` | 6.x | Prisma ORM client |
| `prisma` | 6.x | Prisma CLI (dev dependency) |
| `cloudinary` | 2.x | Cloudinary SDK for image/video uploads |
| `expo-server-sdk` | 3.x | Expo Push Notification dispatch |
| `bcryptjs` | 2.x | Password hashing |
| `class-validator` | 0.14.x | DTO validation |
| `ioredis` | 5.x | Redis client |
| `bullmq` | 5.x | Job queue (vacancy expiry, OTP cleanup, analytics sync) |
| `@sentry/nestjs` | 9.x | Error tracking |

### Media (Cloudinary)

| Feature | Details |
|---|---|
| **Provider** | Cloudinary |
| **Images** | Candidate photos, agency logos, user profile photos |
| **Videos** | Candidate introduction videos (with auto-thumbnail) |
| **Documents** | Passports, medical certs, contracts (PDF) |
| **CDN** | Built-in Cloudinary CDN |

### Infrastructure

| Service | Purpose |
|---|---|
| **Neon** | Managed PostgreSQL (serverless, branching, auto-scaling) |
| **Redis** | Caching, BullMQ job queue, rate limiting, OTP store |
| **Cloudinary** | Media storage and CDN (images, videos, documents) |
| **Expo Push** | Push notifications to mobile (replaces Firebase FCM) |
| **SMSEthiopia** | SMS for Ethiopian users (OTP, notifications) |
| **Docker** | Containerized backend + admin deployments |
| **Cloudflare** | DNS, CDN, DDoS protection, SSL termination |
| **GitHub Actions** | CI/CD pipelines (lint, test, build, deploy) |
| **Sentry** | Error tracking + performance monitoring |

---

## 4. Folder Structure

### Backend (NestJS + Fastify)

```
backend/
├── src/
│   ├── config/
│   │   ├── configuration.ts       # Type-safe ConfigModule setup
│   │   ├── cloudinary.config.ts   # Cloudinary SDK init
│   │   └── redis.config.ts        # Redis client & BullMQ config
│   │
│   ├── common/
│   │   ├── decorators/            # @CurrentUser(), @CurrentAdmin(), @Roles(), @Public()
│   │   ├── guards/                # JwtAuthGuard, AdminJwtGuard, RolesGuard, AgencyGuard
│   │   ├── interceptors/          # TransformInterceptor, LoggingInterceptor
│   │   ├── filters/               # HttpExceptionFilter, PrismaExceptionFilter
│   │   └── dto/                   # PaginatedQueryDto, PaginationMetaDto
│   │
│   ├── modules/
│   │   ├── auth/                  # User & Admin authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/               # LoginDto, RegisterDto, VerifyOtpDto
│   │   │   └── strategies/        # UserJwtStrategy, AdminJwtStrategy
│   │   │
│   │   ├── users/                 # User profiles management
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/               # UpdateUserProfileDto, UpdateEmployerProfileDto
│   │   │
│   │   ├── candidates/            # Candidate profiles & media
│   │   │   ├── candidates.controller.ts
│   │   │   ├── admin-candidates.controller.ts
│   │   │   ├── candidates.service.ts
│   │   │   └── dto/               # CreateCandidateDto, QueryCandidateDto
│   │   │
│   │   ├── vacancies/             # Job vacancies management
│   │   │   ├── vacancies.controller.ts
│   │   │   ├── admin-vacancies.controller.ts
│   │   │   ├── vacancies.service.ts
│   │   │   └── dto/               # CreateVacancyDto, QueryVacancyDto
│   │   │
│   │   ├── applications/          # Job applications flow
│   │   │   ├── applications.controller.ts
│   │   │   └── applications.service.ts
│   │   │
│   │   ├── inquiries/             # Candidate inquiries flow
│   │   │   ├── inquiries.controller.ts
│   │   │   └── inquiries.service.ts
│   │   │
│   │   ├── pipeline/              # 5-stage hiring pipeline
│   │   │   ├── pipeline.controller.ts
│   │   │   └── pipeline.service.ts
│   │   │
│   │   ├── notifications/         # Expo Push + in-app notifications
│   │   │   ├── notifications.controller.ts
│   │   │   ├── push.service.ts    # Expo Push API client
│   │   │   └── notifications.service.ts
│   │   │
│   │   ├── sms/                   # SMSEthiopia integration
│   │   │   └── sms.service.ts
│   │   │
│   │   ├── media/                 # Cloudinary upload service
│   │   │   └── media.service.ts
│   │   │
│   │   ├── prisma/                # Database service
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   │
│   │   └── jobs/                  # BullMQ job processors
│   │       ├── vacancy-expiry.processor.ts
│   │       └── otp-cleanup.processor.ts
│   │
│   ├── app.module.ts              # Root NestJS module
│   └── main.ts                    # Fastify adapter bootstrap & OpenAPI setup
│
├── prisma/
│   ├── schema.prisma              # Complete Prisma database schema
│   ├── migrations/                # Prisma migration history
│   └── seed.ts                    # Database seed script (categories, plans)
│
├── .env
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### Mobile (React Native + Expo)

```
frontend/ (mobile)
├── app/                           # Expo Router file-based routing
│   ├── (auth)/                    # Auth stack (welcome, login, register, otp)
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── otp-verify.tsx
│   ├── (tabs)/                    # Main tab navigator
│   │   ├── index.tsx              # Home (Candidates / Vacancies based on mode)
│   │   ├── saved.tsx
│   │   ├── messages.tsx
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── candidate/
│   │   └── [id].tsx               # Candidate detail screen
│   ├── vacancy/
│   │   └── [id].tsx               # Vacancy detail screen
│   └── _layout.tsx                # Root layout with QueryClientProvider
│
├── src/
│   ├── api/                       # Axios client & TanStack Query options
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── candidates.api.ts
│   │   └── vacancies.api.ts
│   │
│   ├── hooks/                     # TanStack Query custom hooks
│   │   ├── useCandidates.ts       # Query & mutation hooks for candidates
│   │   ├── useVacancies.ts        # Query & mutation hooks for vacancies
│   │   ├── useAuth.ts             # Auth state & mutation hooks
│   │   └── useNotifications.ts    # Expo Push Notifications registration
│   │
│   ├── store/                     # Zustand stores
│   │   ├── auth.store.ts          # JWT token & user session state
│   │   └── ui.store.ts            # Active mode (employer/jobseeker) & filters
│   │
│   ├── components/                # Reusable UI components
│   │   ├── candidate-card.tsx
│   │   ├── vacancy-card.tsx
│   │   ├── contact-buttons.tsx    # WhatsApp, Telegram, IMO, Phone
│   │   ├── video-player.tsx       # Expo Video candidate intro
│   │   └── ui/                    # Base UI elements
│   │
│   └── utils/                     # Formatting, deep links, validators
│
├── app.json                       # Expo config (slug, scheme, plugins)
├── tailwind.config.js             # NativeWind styling configuration
├── tsconfig.json
└── package.json
```

### Admin Panel (Next.js)

```
admin/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Admin login layout & screen
│   │   └── login/page.tsx
│   ├── (dashboard)/               # Authenticated admin layout & sidebar
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Analytics & dashboard overview
│   │   ├── candidates/            # Candidate CRUD & media management
│   │   ├── vacancies/             # Vacancy posting & management
│   │   ├── applications/         # Job applications list & detail
│   │   ├── inquiries/            # Employer inquiries inbox
│   │   ├── pipeline/             # Visual hiring pipeline board
│   │   ├── staff/                 # Staff team management
│   │   └── settings/             # Agency configuration & contact channels
│   └── layout.tsx                 # Root layout with providers
│
├── components/
│   ├── ui/                        # shadcn/ui components (Button, Dialog, Table, Badge, etc.)
│   ├── dashboard/                 # Analytics charts & summary cards
│   ├── pipeline/                  # Pipeline stage kanban / progress bar
│   └── layout/                    # Admin sidebar, navbar, user menu
│
├── lib/                           # API client, auth helpers, utility functions
├── hooks/                         # TanStack Query hooks for admin endpoints
├── types/                         # TypeScript interfaces and DTO definitions
├── tailwind.config.ts
└── package.json
```

---

## 5. Environment Variables

### Backend `.env`

```env
# Server
NODE_ENV=development
PORT=5000
API_PREFIX=api/v1

# Neon Managed PostgreSQL (Prisma Connection)
DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/recruitment_db?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/recruitment_db?sslmode=require"

# Redis & BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets
JWT_SECRET=your_super_secret_user_jwt_key_here
JWT_EXPIRES_IN=30d
ADMIN_JWT_SECRET=different_super_secret_admin_jwt_key_here
ADMIN_JWT_EXPIRES_IN=8h

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMSEthiopia (SMS & OTP Provider)
SMS_ETHIOPIA_API_KEY=your_smsethiopia_api_key
SMS_ETHIOPIA_SENDER_ID=AGENCY

# Expo Push Notifications
EXPO_ACCESS_TOKEN=your_expo_access_token

# Sentry
SENTRY_DSN=https://xxxxxxxx.ingest.sentry.io/xxxxxxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://admin.yourapp.com
```

### Mobile `.env` (Expo Extra)

```env
EXPO_PUBLIC_API_BASE_URL=https://api.yourapp.com/api/v1
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

### Admin Panel `.env.local` (Next.js)

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com/api/v1
```

---

## 6. Database Setup & Migrations (Prisma + Neon)

### Setup & Migration Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations on Neon database
npx prisma migrate dev --name init

# Seed initial database records (categories, plans)
npx prisma db seed

# Open Prisma Studio (GUI database editor)
npx prisma studio
```

### Prisma Schema Overview (`prisma/schema.prisma` excerpt)

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

enum PipelineStage {
  INTERVIEWING
  MEDICAL_BIOMETRICS
  VISA_PROCESSING
  PRE_DEPARTURE_TRAINING
  DEPLOYED
}

model Agency {
  id               String            @id @default(uuid())
  name             String
  licenseNumber    String?
  logoUrl          String?
  isActive         Boolean           @default(true)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  adminUsers       AdminUser[]
  candidates       Candidate[]
  vacancies        JobVacancy[]
  hiringPipelines  HiringPipeline[]

  @@map("agencies")
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

  agency    Agency   @relation(fields: [agencyId], references: [id])

  @@map("admin_users")
}

model User {
  id            String        @id @default(uuid())
  firstName     String        @map("first_name")
  lastName      String        @map("last_name")
  phone         String        @unique
  email         String?       @unique
  password      String
  preferredMode PreferredMode @default(JOB_SEEKER) @map("preferred_mode")
  phoneVerified Boolean       @default(false) @map("phone_verified")
  isActive      Boolean       @default(true) @map("is_active")
  createdAt     DateTime      @default(now()) @map("created_at")

  @@map("users")
}
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

### Auth Guard (`user-jwt.guard.ts`)

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserJwtGuard extends AuthGuard('user-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired user token');
    }
    return user;
  }
}
```

### Admin Auth Guard (`admin-jwt.guard.ts`)

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminJwtGuard extends AuthGuard('admin-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, admin: any) {
    if (err || !admin) {
      throw err || new UnauthorizedException('Invalid or expired admin token');
    }
    return admin;
  }
}
```

### Role Guard & Decorator (`roles.guard.ts`)

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}

// Usage in NestJS Controller:
// @UseGuards(AdminJwtGuard, RolesGuard)
// @Roles(Role.SUPER_ADMIN, Role.ADMIN)
// @Delete(':id')
// async deleteCandidate(@Param('id') id: string) { ... }
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

## 9. File Storage — Cloudinary

### Folder & Asset Structure

```
Cloudinary Account /
├── agencies/
│   └── {agency_id}/
│       ├── logos/           # Agency brand logos
│       └── banners/         # Agency promotional banners
│
├── candidates/
│   └── {agency_id}/
│       └── {candidate_id}/
│           ├── photos/      # Profile photos (auto-cropped, face detection)
│           ├── videos/      # Intro video clips (auto HLS/MP4 transcoding & poster frame)
│           └── documents/   # PDF passports, medical certificates
│
├── pipeline/
│   └── {agency_id}/
│       └── {pipeline_id}/   # Offer letters, visa documents, tickets
│
└── users/
    └── {user_id}/           # Employer & candidate app profile photos
```

### Media Service Implementation (`media.service.ts`)

```typescript
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(fileBuffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(new InternalServerErrorException('Cloudinary image upload failed'));
          resolve(result!.secure_url);
        },
      ).end(fileBuffer);
    });
  }

  async uploadVideo(fileBuffer: Buffer, folder: string): Promise<{ url: string; thumbnailUrl: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video',
          eager: [{ format: 'jpg', transformation: [{ width: 500, crop: 'scale' }] }],
        },
        (error, result) => {
          if (error) return reject(new InternalServerErrorException('Cloudinary video upload failed'));
          const thumbnailUrl = result!.eager && result!.eager[0] ? result!.eager[0].secure_url : '';
          resolve({ url: result!.secure_url, thumbnailUrl });
        },
      ).end(fileBuffer);
    });
  }

  async deleteMedia(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
```

---

## 10. Push Notifications — Expo Push Notifications

### Overview
Replaces Firebase Cloud Messaging (FCM). The backend uses `expo-server-sdk` to dispatch push tickets to Expo's Push API, which routes notifications to APNs (iOS) and FCM/Android natively.

### Backend — Dispatch Service (`push.service.ts`)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushNotificationService {
  private expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private prisma: PrismaService) {}

  async sendToUser(userId: string, title: string, body: string, data: Record<string, any> = {}) {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
    });

    const messages: ExpoPushMessage[] = [];
    for (const tokenRecord of tokens) {
      if (!Expo.isExpoPushToken(tokenRecord.token)) {
        this.logger.error(`Invalid Expo Push Token: ${tokenRecord.token}`);
        continue;
      }
      messages.push({
        to: tokenRecord.token,
        sound: 'default',
        title,
        body,
        data,
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        this.logger.log(`Push sent: ${ticketChunk.length} tickets`);
      } catch (error) {
        this.logger.error('Error sending Expo push notification chunk', error);
      }
    }
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
| Pipeline stage changed | User / Candidate | "Hiring Status Update" | "Your process moved to {stage}" |

### Mobile — Register Push Hook (`useNotifications.ts`)

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { api } from '../api/client';

export function useNotifications() {
  useEffect(() => {
    async function registerForPush() {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      await api.post('/users/me/device-tokens', {
        token: tokenData.data,
        platform: Platform.OS,
      });
    }

    registerForPush();
  }, []);
}
```

---

## 11. SMS & OTP — SMSEthiopia

### Integration Strategy
Replaces Africa's Talking for SMS delivery in Ethiopia. Used for phone number verification, OTP logins, password resets, and critical status alerts.

### SMS Service Implementation (`sms.service.ts`)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsEthiopiaService {
  private readonly logger = new Logger(SmsEthiopiaService.name);
  private readonly apiKey: string;
  private readonly senderId: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SMS_ETHIOPIA_API_KEY') || '';
    this.senderId = this.configService.get<string>('SMS_ETHIOPIA_SENDER_ID') || 'AGENCY';
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post('https://api.smsethiopia.com/v1/sms/send', {
        key: this.apiKey,
        to,
        message,
        sender: this.senderId,
      });
      return response.data?.status === 'success';
    } catch (error) {
      this.logger.error(`SMSEthiopia dispatch failed to ${to}: ${error.message}`);
      return false;
    }
  }

  async sendOTP(phone: string, otp: string, purpose: string): Promise<boolean> {
    const templates: Record<string, string> = {
      registration: `Your verification code is: ${otp}. Valid for 10 minutes.`,
      password_reset: `Your password reset code is: ${otp}. Valid for 10 minutes.`,
    };
    const message = templates[purpose] || `Your OTP verification code is: ${otp}`;
    return this.sendSMS(phone, message);
  }
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

## 18. Deployment & Infrastructure

### 1. Backend Deployment (Docker Container)

```dockerfile
# Dockerfile
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

### 2. Cloudflare Network Layer
- **DNS & CDN:** Proxy backend and admin domains through Cloudflare.
- **SSL / TLS:** Full (Strict) SSL mode.
- **DDoS & Rate Limiting:** Enforce API rate limits at Cloudflare edge.

### 3. Managed Database (Neon) & Redis
- **Neon:** Auto-scaling serverless PostgreSQL. Direct and pooled connection strings.
- **Redis:** Cloud-hosted or containerized Redis for Caching and BullMQ queue processing.

### 4. Monitoring & Error Tracking (Sentry)
- Backend: `@sentry/nestjs` initialized in `main.ts`
- Mobile: `@sentry/react-native` initialized in `_layout.tsx`
- Admin: `@sentry/nextjs` initialized in `instrumentation.ts`

---

## 19. Build Order

### Phase 1 — Technical Architecture Documentation Update (Completed)
- [x] Update `Documentation.md` to version 2.0 (NestJS, Fastify, Prisma, Neon, Cloudinary, Expo Push, SMSEthiopia, Next.js Admin, Docker, Cloudflare, Sentry, White/Green/Blue brand palette).

### Phase 2 — NestJS Backend Scaffolding
- [ ] Initialize NestJS + Fastify project structure.
- [ ] Configure `prisma/schema.prisma` with Neon connection strings and run initial migration (`npx prisma migrate dev`).
- [ ] Create `PrismaService` & `PrismaModule`.
- [ ] Implement `MediaService` (Cloudinary integration).
- [ ] Implement `SmsEthiopiaService` (SMSEthiopia integration).
- [ ] Implement `PushNotificationService` (Expo Push Notifications).
- [ ] Implement `AuthModule` (User & Admin JWT strategies, Passport, Bcrypt).
- [ ] Set up Fastify Swagger / OpenAPI documentation endpoints.

### Phase 3 — Next.js Admin Dashboard Scaffolding
- [ ] Initialize Next.js (App Router, TypeScript, Tailwind CSS, shadcn/ui).
- [ ] Build layout shell (Sidebar, Header, Brand Palette styling).
- [ ] Implement TanStack Query provider and Axios client for API authorization.
- [ ] Build Candidates CRUD & media upload screens.
- [ ] Build Vacancies CRUD & status control screens.
- [ ] Build visual 5-stage Hiring Pipeline kanban board.
- [ ] Build Applications and Inquiries inbox panels.

### Phase 4 — Expo Mobile App Refactoring
- [ ] Refactor state management to TanStack Query (server state) and Zustand (client state).
- [ ] Integrate React Hook Form + Zod for authentication and profile input validation.
- [ ] Integrate `useNotifications` hook for Expo Push Notifications token registration.
- [ ] Test candidate intro video playback (`expo-video`) and image caching (`expo-image`).

---

## 20. Brand Identity & UI Design System

### Color Palette

| Token | Color Code | Tailwind Class | Usage |
|---|---|---|---|
| **Primary White** | `#FFFFFF` | `bg-white`, `text-white` | Card backgrounds, main clean page container, high contrast text |
| **Brand Green** | `#10B981` | `bg-emerald-500`, `text-emerald-500` | Primary CTA buttons, success status badges, active selection borders |
| **Brand Blue** | `#3B82F6` | `bg-blue-500`, `text-blue-500` | Secondary CTA, active navigation tabs, informative badges, link highlights |
| **Dark Neutral** | `#0F172A` | `bg-slate-900`, `text-slate-900` | Main body text, dark mode background, high-contrast headers |
| **Light Neutral** | `#F8FAFC` | `bg-slate-50`, `border-slate-200` | App background, subtle borders, input field fills |

---

*End of Build Documentation — v2.0*  
*Stack: NestJS + Fastify · Prisma + Neon · Cloudinary · Expo Push · SMSEthiopia · Next.js Admin · React Native + Expo*
