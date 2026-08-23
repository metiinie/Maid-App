# Maid-App Remediation & Gap Implementation Plan

This document outlines the step-by-step execution roadmap to resolve all database schema conflicts, NestJS backend API gaps, route signature mismatches, frontend mock fallbacks, and missing strategic features across the **Maid-App** platform.

---

## 📅 Roadmap Overview

```
Phase 1: DB & Multi-Tenancy Consolidation
  ├── Unify Agency & Organization models
  ├── Add composite indexes & cascade rules
  └── Apply Prisma migrations

Phase 2: Auth, Registration & Security Refactoring
  ├── Implement POST /auth/register & PIN reset
  ├── Add class-validator DTOs
  └── Enforce agency ownership on candidate creation

Phase 3: Missing Backend Controllers & API Realignment
  ├── Build Admin Candidates Controller
  ├── Build Notifications Controller
  ├── Build Admin Conversations Controller & Thread Init
  ├── Build User Pipelines Controller
  └── Realign route signatures (/admin/pipelines, PATCH)

Phase 4: Frontend API Sync & Mock Cleanup
  ├── Dynamic X-Workspace-Id header interceptor
  ├── Remove silent mock fallbacks from authService.ts
  └── Connect register.tsx & pipeline UI to live APIs

Phase 5: Strategic Feature Implementation
  ├── Agency Onboarding Self-Service Portal
  ├── Compliance Document Verification Matrix
  └── Real-Time WebSockets (Socket.io Gateway)
```

---

## 🛠️ Phase 1: Database Schema & Multi-Tenancy Consolidation

### Objectives
- Eliminate the architectural split between `Agency` (legacy) and `Organization` (workspace model).
- Standardize primary tenant reference across `Candidate`, `JobVacancy`, `HiringPipeline`, and `Conversation` on `organizationId`.
- Add performance indexes and document verification statuses.

### Files to Modify
- `backend/prisma/schema.prisma`
- `backend/src/common/guards/workspace.guard.ts`
- `backend/src/prisma/prisma.service.ts`

---

## 🔐 Phase 2: Auth, Registration & Security Refactoring

### Objectives
- Enable mobile user registration via `POST /auth/register`.
- Support PIN recovery via verified OTP (`POST /auth/pin/reset`).
- Secure endpoints with strict `class-validator` DTOs and workspace ownership validation.

### Files to Modify / Create
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/dto/register-user.dto.ts` [NEW]
- `backend/src/candidates/dto/create-candidate.dto.ts` [NEW]

---

## ⚡ Phase 3: Missing Backend Controllers & API Realignment

### Objectives
- Create missing NestJS controllers for Admin Candidates, Notifications, Admin Conversations, and User Pipelines.
- Realign route names (`admin/pipelines`) and HTTP methods (`PATCH /:id/stage`).

### Files to Create / Modify
- `backend/src/candidates/admin-candidates.controller.ts` [NEW]
- `backend/src/notifications/notifications.controller.ts` [NEW]
- `backend/src/conversations/admin-conversations.controller.ts` [NEW]
- `backend/src/pipeline/user-pipeline.controller.ts` [NEW]
- `backend/src/pipeline/pipeline.controller.ts` [MODIFY]
- `backend/src/conversations/conversations.controller.ts` [MODIFY]

---

## 📱 Phase 4: Frontend API Sync & Mock Cleanup

### Objectives
- Remove silent mock data fallback traps in `authService.ts`.
- Attach `X-Workspace-Id` header dynamically in Axios interceptor (`api.ts`).
- Connect `register.tsx` and pipeline UI to live backend endpoints.

### Files to Modify
- `frontend/services/api.ts`
- `frontend/services/authService.ts`
- `frontend/services/pipelineService.ts`
- `frontend/app/(auth)/register.tsx`
- `frontend/app/(admin)/pipeline.tsx`

---

## 🚀 Phase 5: Strategic Feature Implementation

### Objectives
- Build Agency Onboarding Portal with Ministry of Labor license verification.
- Implement Document Verification Matrix badges (`VERIFIED`, `EXPIRED`, `PENDING`).
- Deploy Socket.io WebSocket Gateway (`chat.gateway.ts`) for real-time messaging.

### Files to Create
- `backend/src/agencies/agencies.controller.ts` [NEW]
- `backend/src/chat/chat.gateway.ts` [NEW]
