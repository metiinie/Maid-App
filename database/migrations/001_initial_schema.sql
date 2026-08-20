-- ============================================================================
-- Ethiopian Recruitment Agency Platform — Initial Schema Migration
-- Version: 001
-- Database: PostgreSQL 15+ (Neon Serverless)
-- Generated: 2026-08-19
-- ============================================================================
-- This migration creates all tables across 12+ domains:
--   1.  Tenancy & Subscriptions
--   2.  Authentication & Users
--   3.  User Profiles
--   4.  Categories
--   5.  Candidates
--   6.  Job Vacancies
--   7.  Engagement
--   8.  Hiring Pipeline
--   9.  Communication
--   10. Agency Configuration
--   11. Analytics & Logs
--   12. Moderation
--   +   Payments, Content, Feedback, Sessions
-- ============================================================================

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TYPE billing_cycle        AS ENUM ('monthly', 'annual');
CREATE TYPE subscription_status  AS ENUM ('active', 'expired', 'cancelled', 'paused');
CREATE TYPE admin_role           AS ENUM ('super_admin', 'admin', 'staff');
CREATE TYPE user_mode            AS ENUM ('job_seeker', 'employer');
CREATE TYPE gender_type          AS ENUM ('male', 'female', 'other');
CREATE TYPE otp_identifier_type  AS ENUM ('email', 'phone');
CREATE TYPE otp_purpose          AS ENUM ('registration', 'password_reset', 'login');
CREATE TYPE device_platform      AS ENUM ('ios', 'android');
CREATE TYPE education_level      AS ENUM ('primary', 'secondary', 'diploma', 'bachelor', 'master', 'phd');
CREATE TYPE proficiency_level    AS ENUM ('basic', 'intermediate', 'advanced', 'expert');
CREATE TYPE language_proficiency AS ENUM ('basic', 'conversational', 'fluent', 'native');
CREATE TYPE category_type        AS ENUM ('job', 'skill');
CREATE TYPE medical_status       AS ENUM ('pending', 'cleared', 'not_cleared');
CREATE TYPE visa_status          AS ENUM ('no_visa', 'processing', 'has_visa');
CREATE TYPE employer_type        AS ENUM ('individual_family', 'small_business', 'large_business', 'hospital', 'business');
CREATE TYPE contract_type        AS ENUM ('full_time', 'part_time', 'contract');
CREATE TYPE vacancy_status       AS ENUM ('draft', 'active', 'paused', 'closed', 'expired');
CREATE TYPE gender_preference    AS ENUM ('male', 'female', 'any');
CREATE TYPE application_status   AS ENUM ('submitted', 'under_review', 'shortlisted', 'selected', 'rejected', 'withdrawn');
CREATE TYPE inquiry_status       AS ENUM ('new', 'read', 'responded', 'closed');
CREATE TYPE contact_channel      AS ENUM ('phone', 'whatsapp', 'telegram', 'imo', 'email', 'in_app', 'website');
CREATE TYPE pipeline_stage       AS ENUM ('interviewing', 'medical_biometrics', 'visa_processing', 'pre_departure_training', 'deployed');
CREATE TYPE pipeline_outcome     AS ENUM ('successful', 'cancelled', 'candidate_withdrew', 'employer_cancelled');
CREATE TYPE sender_type          AS ENUM ('user', 'admin');
CREATE TYPE attachment_type      AS ENUM ('image', 'document', 'audio', 'video');
CREATE TYPE notification_type    AS ENUM ('application_update', 'new_inquiry', 'pipeline_update', 'new_vacancy', 'new_candidate', 'system', 'general');
CREATE TYPE action_link_type     AS ENUM ('open_vacancy', 'open_candidate', 'open_application', 'open_pipeline');
CREATE TYPE context_type         AS ENUM ('candidate_inquiry', 'job_application', 'general');
CREATE TYPE report_entity_type   AS ENUM ('candidate', 'vacancy', 'user', 'agency');
CREATE TYPE report_reason        AS ENUM ('inappropriate_content', 'fraud', 'spam', 'harassment', 'other');
CREATE TYPE report_status        AS ENUM ('pending', 'under_review', 'resolved', 'dismissed');
CREATE TYPE log_action           AS ENUM ('created', 'updated', 'deleted', 'approved', 'rejected', 'stage_changed');
CREATE TYPE log_entity_type      AS ENUM ('candidate', 'vacancy', 'application', 'pipeline', 'user', 'agency', 'inquiry');
CREATE TYPE contact_click_context AS ENUM ('candidate', 'vacancy', 'agency');
CREATE TYPE payment_status       AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_provider     AS ENUM ('chapa', 'telebirr', 'stripe', 'bank_transfer', 'manual');
CREATE TYPE invoice_status       AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE announcement_target  AS ENUM ('all', 'job_seekers', 'employers', 'admins');
CREATE TYPE company_type         AS ENUM ('individual_family', 'small_business', 'large_business');

-- ──────────────────────────────────────────────────────────────────────────────
-- HELPER: auto-update updated_at trigger function
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- DOMAIN 1: TENANCY & SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE subscription_plans (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(100)   NOT NULL,
  description       TEXT,
  price             DECIMAL(10,2)  NOT NULL,
  billing_cycle     billing_cycle  NOT NULL DEFAULT 'monthly',
  max_candidates    INTEGER        NOT NULL DEFAULT -1,  -- -1 = unlimited
  max_job_postings  INTEGER        NOT NULL DEFAULT -1,
  max_admin_users   INTEGER        NOT NULL DEFAULT 5,
  features          JSONB,
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE agencies (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255)   NOT NULL,
  slug              VARCHAR(100)   NOT NULL UNIQUE,
  logo_url          VARCHAR(500),
  description       TEXT,
  license_number    VARCHAR(100),
  license_expiry    DATE,
  phone             VARCHAR(50),
  email             VARCHAR(255)   UNIQUE,
  website           VARCHAR(255),
  address           TEXT,
  city              VARCHAR(100),
  country           VARCHAR(100)   NOT NULL DEFAULT 'Ethiopia',
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  is_verified       BOOLEAN        NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE agency_subscriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  plan_id           UUID           NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status            subscription_status NOT NULL DEFAULT 'active',
  start_date        DATE           NOT NULL,
  end_date          DATE           NOT NULL,
  amount_paid       DECIMAL(10,2),
  payment_method    VARCHAR(50),
  payment_reference VARCHAR(255),
  auto_renew        BOOLEAN        NOT NULL DEFAULT true,
  cancelled_at      TIMESTAMPTZ,
  cancel_reason     TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Additional: Payments ─────────────────────────────────────────────────────

CREATE TABLE payment_transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id           UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  subscription_id     UUID           REFERENCES agency_subscriptions(id) ON DELETE SET NULL,
  amount              DECIMAL(10,2)  NOT NULL,
  currency            VARCHAR(10)    NOT NULL DEFAULT 'ETB',
  provider            payment_provider NOT NULL,
  provider_tx_id      VARCHAR(255),
  status              payment_status NOT NULL DEFAULT 'pending',
  payment_method      VARCHAR(50),
  paid_at             TIMESTAMPTZ,
  failed_reason       TEXT,
  metadata            JSONB          DEFAULT '{}',
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id           UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  subscription_id     UUID           REFERENCES agency_subscriptions(id) ON DELETE SET NULL,
  invoice_number      VARCHAR(50)    NOT NULL UNIQUE,
  amount              DECIMAL(10,2)  NOT NULL,
  tax_amount          DECIMAL(10,2)  DEFAULT 0,
  total_amount        DECIMAL(10,2)  NOT NULL,
  currency            VARCHAR(10)    NOT NULL DEFAULT 'ETB',
  status              invoice_status NOT NULL DEFAULT 'draft',
  due_date            DATE           NOT NULL,
  paid_at             TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 2: AUTHENTICATION & USERS
-- ============================================================================

CREATE TABLE admin_users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  first_name        VARCHAR(100)   NOT NULL,
  last_name         VARCHAR(100)   NOT NULL,
  email             VARCHAR(255)   NOT NULL UNIQUE,
  phone             VARCHAR(50),
  password_hash     VARCHAR(255)   NOT NULL,
  role              admin_role     NOT NULL DEFAULT 'staff',
  permissions       JSONB          NOT NULL DEFAULT '{}',
  profile_photo_url VARCHAR(500),
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  email_verified    BOOLEAN        NOT NULL DEFAULT false,
  last_login        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name        VARCHAR(100)   NOT NULL,
  last_name         VARCHAR(100)   NOT NULL,
  email             VARCHAR(255)   UNIQUE,
  phone             VARCHAR(50)    NOT NULL UNIQUE,
  password_hash     VARCHAR(255)   NOT NULL,
  date_of_birth     DATE,
  gender            gender_type,
  nationality       VARCHAR(100),
  profile_photo_url VARCHAR(500),
  preferred_mode    user_mode      NOT NULL DEFAULT 'job_seeker',
  is_verified       BOOLEAN        NOT NULL DEFAULT false,
  phone_verified    BOOLEAN        NOT NULL DEFAULT false,
  email_verified    BOOLEAN        NOT NULL DEFAULT false,
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  is_blocked        BOOLEAN        NOT NULL DEFAULT false,
  last_login        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE otp_verifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier        VARCHAR(255)   NOT NULL,
  identifier_type   otp_identifier_type NOT NULL,
  otp_code          VARCHAR(10)    NOT NULL,
  purpose           otp_purpose    NOT NULL,
  user_id           UUID           REFERENCES users(id) ON DELETE CASCADE,
  attempts          INTEGER        NOT NULL DEFAULT 0,
  expires_at        TIMESTAMPTZ    NOT NULL,
  verified_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE password_resets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID           REFERENCES users(id) ON DELETE CASCADE,
  admin_user_id     UUID           REFERENCES admin_users(id) ON DELETE CASCADE,
  reset_token       VARCHAR(255)   NOT NULL UNIQUE,
  expires_at        TIMESTAMPTZ    NOT NULL,
  used_at           TIMESTAMPTZ,
  ip_address        INET,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_password_reset_owner CHECK (
    (user_id IS NOT NULL AND admin_user_id IS NULL)
    OR (user_id IS NULL AND admin_user_id IS NOT NULL)
  )
);

CREATE TABLE device_tokens (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID           REFERENCES users(id) ON DELETE CASCADE,
  admin_user_id     UUID           REFERENCES admin_users(id) ON DELETE CASCADE,
  token             VARCHAR(500)   NOT NULL,
  platform          device_platform NOT NULL,
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Additional: Sessions ─────────────────────────────────────────────────────

CREATE TABLE user_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID           REFERENCES users(id) ON DELETE CASCADE,
  admin_user_id     UUID           REFERENCES admin_users(id) ON DELETE CASCADE,
  refresh_token     VARCHAR(500)   NOT NULL UNIQUE,
  ip_address        INET,
  user_agent        TEXT,
  expires_at        TIMESTAMPTZ    NOT NULL,
  is_revoked        BOOLEAN        NOT NULL DEFAULT false,
  revoked_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 3: USER PROFILES
-- ============================================================================

CREATE TABLE user_jobseeker_profiles (
  id                            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                       UUID           NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio                           TEXT,
  current_country               VARCHAR(100),
  city                          VARCHAR(100),
  education_level               education_level,
  years_of_experience           INTEGER        NOT NULL DEFAULT 0,
  passport_number               VARCHAR(100),
  passport_expiry               DATE,
  has_overseas_experience        BOOLEAN        NOT NULL DEFAULT false,
  preferred_destination_countries TEXT[],
  preferred_job_categories      TEXT[],
  expected_salary_min           DECIMAL(10,2),
  expected_salary_currency      VARCHAR(10)    NOT NULL DEFAULT 'USD',
  availability_date             DATE,
  cv_url                        VARCHAR(500),
  created_at                    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE user_jobseeker_skills (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID           NOT NULL REFERENCES user_jobseeker_profiles(id) ON DELETE CASCADE,
  skill_name        VARCHAR(100)   NOT NULL,
  proficiency_level proficiency_level
);

CREATE TABLE user_jobseeker_languages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID           NOT NULL REFERENCES user_jobseeker_profiles(id) ON DELETE CASCADE,
  language          VARCHAR(100)   NOT NULL,
  proficiency       language_proficiency
);

CREATE TABLE user_employer_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID           NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name      VARCHAR(255),
  company_type      company_type,
  industry          VARCHAR(100),
  country           VARCHAR(100)   NOT NULL,
  city              VARCHAR(100),
  address           TEXT,
  bio               TEXT,
  website           VARCHAR(255),
  is_verified       BOOLEAN        NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 4: CATEGORIES
-- ============================================================================

CREATE TABLE categories (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(100)   NOT NULL,
  name_ar           VARCHAR(100),       -- Arabic (Middle Eastern employers)
  name_am           VARCHAR(100),       -- Amharic (Ethiopian job seekers)
  description       TEXT,
  icon_url          VARCHAR(500),
  parent_id         UUID           REFERENCES categories(id) ON DELETE SET NULL,
  type              category_type  NOT NULL DEFAULT 'job',
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  sort_order        INTEGER        NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 5: CANDIDATES
-- ============================================================================

CREATE TABLE candidates (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id                 UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  uploaded_by               UUID           NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  first_name                VARCHAR(100)   NOT NULL,
  last_name                 VARCHAR(100)   NOT NULL,
  date_of_birth             DATE,
  gender                    gender_type,
  nationality               VARCHAR(100)   NOT NULL DEFAULT 'Ethiopian',
  religion                  VARCHAR(50),
  profile_photo_url         VARCHAR(500),
  introduction_video_url    VARCHAR(500),
  video_thumbnail_url       VARCHAR(500),
  current_country           VARCHAR(100),
  city                      VARCHAR(100),
  summary                   TEXT,
  education_level           education_level,
  years_of_experience       INTEGER        NOT NULL DEFAULT 0,
  passport_number           VARCHAR(100),
  passport_expiry           DATE,
  medical_clearance_status  medical_status NOT NULL DEFAULT 'pending',
  medical_clearance_date    DATE,
  medical_clearance_expiry  DATE,
  visa_status               visa_status,
  availability_date         DATE,
  is_active                 BOOLEAN        NOT NULL DEFAULT true,
  is_featured               BOOLEAN        NOT NULL DEFAULT false,
  is_deployed               BOOLEAN        NOT NULL DEFAULT false,
  view_count                INTEGER        NOT NULL DEFAULT 0,   -- denormalized
  inquiry_count             INTEGER        NOT NULL DEFAULT 0,   -- denormalized
  created_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE candidate_categories (
  candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (candidate_id, category_id)
);

CREATE TABLE candidate_skills (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  skill_name        VARCHAR(100)   NOT NULL,
  proficiency_level proficiency_level,
  years_experience  INTEGER
);

CREATE TABLE candidate_languages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  language          VARCHAR(100)   NOT NULL,
  proficiency       language_proficiency
);

CREATE TABLE candidate_experience (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_title         VARCHAR(200),
  employer_name     VARCHAR(200),
  country           VARCHAR(100),
  start_date        DATE,
  end_date          DATE,
  is_current        BOOLEAN        NOT NULL DEFAULT false,
  description       TEXT
);

CREATE TABLE candidate_education (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  institution       VARCHAR(255),
  degree            VARCHAR(200),
  field_of_study    VARCHAR(200),
  start_year        INTEGER,
  end_year          INTEGER,
  grade             VARCHAR(50)
);

CREATE TABLE candidate_documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  document_type     VARCHAR(50)    NOT NULL, -- passport | medical_certificate | coc_certificate | work_permit | police_clearance | birth_certificate | other
  document_name     VARCHAR(255),
  document_url      VARCHAR(500)   NOT NULL,
  expiry_date       DATE,
  is_verified       BOOLEAN        NOT NULL DEFAULT false,
  verified_by       UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  verified_at       TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Additional: Candidate References ─────────────────────────────────────────

CREATE TABLE candidate_references (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  reference_name    VARCHAR(200)   NOT NULL,
  relationship      VARCHAR(100),       -- former_employer | colleague | community_leader
  phone             VARCHAR(50),
  email             VARCHAR(255),
  country           VARCHAR(100),
  notes             TEXT,
  is_verified       BOOLEAN        NOT NULL DEFAULT false,
  verified_by       UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 6: JOB VACANCIES
-- ============================================================================

CREATE TABLE job_vacancies (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id                UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  posted_by                UUID           NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  category_id              UUID           REFERENCES categories(id) ON DELETE SET NULL,
  title                    VARCHAR(255)   NOT NULL,
  description              TEXT,
  requirements             TEXT,
  benefits                 TEXT,
  destination_country      VARCHAR(100)   NOT NULL,
  city                     VARCHAR(100),
  employer_name            VARCHAR(255),
  employer_type            employer_type,
  show_employer_name       BOOLEAN        NOT NULL DEFAULT false,
  salary_min               DECIMAL(10,2),
  salary_max               DECIMAL(10,2),
  salary_currency          VARCHAR(10)    NOT NULL DEFAULT 'USD',
  salary_negotiable        BOOLEAN        NOT NULL DEFAULT false,
  contract_duration_months INTEGER,
  contract_type            contract_type,
  working_hours_per_day    DECIMAL(4,1),
  working_days_per_week    INTEGER,
  visa_sponsorship         BOOLEAN        NOT NULL DEFAULT true,
  accommodation_provided   BOOLEAN        NOT NULL DEFAULT false,
  meals_provided           BOOLEAN        NOT NULL DEFAULT false,
  transportation_provided  BOOLEAN        NOT NULL DEFAULT false,
  health_insurance         BOOLEAN        NOT NULL DEFAULT false,
  annual_leave_days        INTEGER,
  gender_preference        gender_preference NOT NULL DEFAULT 'any',
  age_min                  INTEGER,
  age_max                  INTEGER,
  experience_required_years INTEGER       NOT NULL DEFAULT 0,
  education_required       VARCHAR(100),
  religion_preference      VARCHAR(50),
  positions_available      INTEGER        NOT NULL DEFAULT 1,
  positions_filled         INTEGER        NOT NULL DEFAULT 0,
  application_deadline     DATE,
  expected_start_date      DATE,
  status                   vacancy_status NOT NULL DEFAULT 'draft',
  is_featured              BOOLEAN        NOT NULL DEFAULT false,
  view_count               INTEGER        NOT NULL DEFAULT 0,   -- denormalized
  application_count        INTEGER        NOT NULL DEFAULT 0,   -- denormalized
  published_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE vacancy_skills_required (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id        UUID           NOT NULL REFERENCES job_vacancies(id) ON DELETE CASCADE,
  skill_name        VARCHAR(100)   NOT NULL,
  is_required       BOOLEAN        NOT NULL DEFAULT true  -- false = preferred only
);

CREATE TABLE vacancy_languages_required (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id        UUID           NOT NULL REFERENCES job_vacancies(id) ON DELETE CASCADE,
  language          VARCHAR(100)   NOT NULL,
  proficiency_required VARCHAR(30),
  is_required       BOOLEAN        NOT NULL DEFAULT true
);


-- ============================================================================
-- DOMAIN 7: ENGAGEMENT
-- ============================================================================

CREATE TABLE applications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id        UUID           NOT NULL REFERENCES job_vacancies(id) ON DELETE CASCADE,
  user_id           UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id         UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  cover_letter      TEXT,
  additional_notes  TEXT,
  applicant_name    VARCHAR(255)   NOT NULL,   -- snapshot at submission
  applicant_phone   VARCHAR(50)    NOT NULL,
  applicant_email   VARCHAR(255),
  status            application_status NOT NULL DEFAULT 'submitted',
  rejection_reason  TEXT,
  reviewed_by       UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  reviewer_notes    TEXT,
  applied_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE candidate_inquiries (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id              UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id                   UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id                 UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  message                   TEXT,
  preferred_contact_channel contact_channel,
  purpose                   TEXT,
  required_start_date       DATE,
  status                    inquiry_status NOT NULL DEFAULT 'new',
  admin_response            TEXT,
  responded_by              UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  responded_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE saved_candidates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id      UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  notes             TEXT,
  saved_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_candidates UNIQUE (user_id, candidate_id)
);

CREATE TABLE saved_vacancies (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vacancy_id        UUID           NOT NULL REFERENCES job_vacancies(id) ON DELETE CASCADE,
  saved_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_saved_vacancies UNIQUE (user_id, vacancy_id)
);

-- ── Additional: User Feedback ────────────────────────────────────────────────

CREATE TABLE user_feedback (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id         UUID           REFERENCES agencies(id) ON DELETE SET NULL,
  rating            INTEGER        NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment           TEXT,
  context_type      VARCHAR(50),   -- app | agency | candidate | vacancy
  context_id        UUID,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 8: HIRING PIPELINE
-- ============================================================================

CREATE TABLE hiring_pipelines (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id                 UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  candidate_id              UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  vacancy_id                UUID           REFERENCES job_vacancies(id) ON DELETE SET NULL,
  application_id            UUID           REFERENCES applications(id) ON DELETE SET NULL,
  inquiry_id                UUID           REFERENCES candidate_inquiries(id) ON DELETE SET NULL,
  employer_user_id          UUID           REFERENCES users(id) ON DELETE SET NULL,
  employer_name             VARCHAR(255),
  employer_country          VARCHAR(100),
  employer_city             VARCHAR(100),
  employer_contact          VARCHAR(255),
  current_stage             pipeline_stage NOT NULL DEFAULT 'interviewing',
  started_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  expected_deployment_date  DATE,
  actual_deployment_date    DATE,
  contract_end_date         DATE,
  notes                     TEXT,
  is_active                 BOOLEAN        NOT NULL DEFAULT true,
  outcome                   pipeline_outcome,
  outcome_notes             TEXT,
  outcome_date              DATE,
  created_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE pipeline_stage_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id       UUID           NOT NULL REFERENCES hiring_pipelines(id) ON DELETE CASCADE,
  stage             pipeline_stage NOT NULL,
  entered_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  exited_at         TIMESTAMPTZ,
  duration_days     INTEGER,
  notes             TEXT,
  updated_by        UUID           REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE pipeline_documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id       UUID           NOT NULL REFERENCES hiring_pipelines(id) ON DELETE CASCADE,
  document_type     VARCHAR(100)   NOT NULL, -- offer_letter | contract | medical_report | visa | flight_ticket | other
  document_name     VARCHAR(255),
  document_url      VARCHAR(500)   NOT NULL,
  uploaded_by       UUID           NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  notes             TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 9: COMMUNICATION
-- ============================================================================

CREATE TABLE conversations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id             UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id               UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  context_type          context_type,
  context_id            UUID,
  last_message_at       TIMESTAMPTZ,
  last_message_preview  VARCHAR(500),
  user_unread_count     INTEGER        NOT NULL DEFAULT 0,
  admin_unread_count    INTEGER        NOT NULL DEFAULT 0,
  is_archived           BOOLEAN        NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   UUID           NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type       sender_type    NOT NULL,
  sender_user_id    UUID           REFERENCES users(id) ON DELETE SET NULL,
  sender_admin_id   UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  message_text      TEXT,
  attachment_url    VARCHAR(500),
  attachment_type   attachment_type,
  is_read           BOOLEAN        NOT NULL DEFAULT false,
  read_at           TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         UUID           REFERENCES agencies(id) ON DELETE CASCADE,
  user_id           UUID           REFERENCES users(id) ON DELETE CASCADE,
  admin_user_id     UUID           REFERENCES admin_users(id) ON DELETE CASCADE,
  title             VARCHAR(255)   NOT NULL,
  body              TEXT           NOT NULL,
  type              notification_type NOT NULL DEFAULT 'general',
  action_type       action_link_type,
  action_id         UUID,
  data              JSONB          NOT NULL DEFAULT '{}',
  send_push         BOOLEAN        NOT NULL DEFAULT true,
  send_sms          BOOLEAN        NOT NULL DEFAULT false,
  send_in_app       BOOLEAN        NOT NULL DEFAULT true,
  push_sent         BOOLEAN        NOT NULL DEFAULT false,
  push_sent_at      TIMESTAMPTZ,
  sms_sent          BOOLEAN        NOT NULL DEFAULT false,
  sms_sent_at       TIMESTAMPTZ,
  is_read           BOOLEAN        NOT NULL DEFAULT false,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Additional: System Announcements ─────────────────────────────────────────

CREATE TABLE system_announcements (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             VARCHAR(255)   NOT NULL,
  title_ar          VARCHAR(255),
  title_am          VARCHAR(255),
  body              TEXT           NOT NULL,
  body_ar           TEXT,
  body_am           TEXT,
  target_audience   announcement_target NOT NULL DEFAULT 'all',
  agency_id         UUID           REFERENCES agencies(id) ON DELETE CASCADE,  -- NULL = platform-wide
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  starts_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  ends_at           TIMESTAMPTZ,
  created_by        UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 10: AGENCY CONFIGURATION
-- ============================================================================

CREATE TABLE agency_contact_channels (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  channel_type      contact_channel NOT NULL,
  channel_value     VARCHAR(255)   NOT NULL,
  label             VARCHAR(100),
  is_primary        BOOLEAN        NOT NULL DEFAULT false,
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  sort_order        INTEGER        NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE agency_settings (
  id                                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id                         UUID           NOT NULL UNIQUE REFERENCES agencies(id) ON DELETE CASCADE,
  primary_color                     VARCHAR(10),
  secondary_color                   VARCHAR(10),
  banner_url                        VARCHAR(500),
  allow_in_app_applications         BOOLEAN        NOT NULL DEFAULT true,
  allow_in_app_inquiries            BOOLEAN        NOT NULL DEFAULT true,
  show_salary_in_vacancies          BOOLEAN        NOT NULL DEFAULT true,
  require_user_verification         BOOLEAN        NOT NULL DEFAULT false,
  notify_admin_on_new_inquiry       BOOLEAN        NOT NULL DEFAULT true,
  notify_admin_on_new_application   BOOLEAN        NOT NULL DEFAULT true,
  notify_user_on_status_update      BOOLEAN        NOT NULL DEFAULT true,
  sms_sender_id                     VARCHAR(50),
  extra_settings                    JSONB          NOT NULL DEFAULT '{}',
  updated_at                        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_by                        UUID           REFERENCES admin_users(id) ON DELETE SET NULL
);


-- ============================================================================
-- DOMAIN 11: ANALYTICS & LOGS
-- ============================================================================

CREATE TABLE candidate_views (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID           NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id           UUID           REFERENCES users(id) ON DELETE SET NULL,
  agency_id         UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  session_id        VARCHAR(100),
  viewed_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE vacancy_views (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id        UUID           NOT NULL REFERENCES job_vacancies(id) ON DELETE CASCADE,
  user_id           UUID           REFERENCES users(id) ON DELETE SET NULL,
  agency_id         UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  session_id        VARCHAR(100),
  viewed_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE contact_click_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID           REFERENCES users(id) ON DELETE SET NULL,
  agency_id         UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  contact_type      contact_channel NOT NULL,
  context_type      contact_click_context NOT NULL,
  context_id        UUID           NOT NULL,
  clicked_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE activity_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         UUID           REFERENCES agencies(id) ON DELETE SET NULL,
  admin_user_id     UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  user_id           UUID           REFERENCES users(id) ON DELETE SET NULL,
  action            log_action     NOT NULL,
  entity_type       log_entity_type NOT NULL,
  entity_id         UUID,
  old_values        JSONB,
  new_values        JSONB,
  ip_address        INET,
  user_agent        TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- DOMAIN 12: MODERATION
-- ============================================================================

CREATE TABLE blocked_users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         UUID           NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id           UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason            TEXT,
  blocked_by        UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  blocked_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  unblocked_at      TIMESTAMPTZ
);

CREATE TABLE reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_user_id  UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type       report_entity_type NOT NULL,
  entity_id         UUID           NOT NULL,
  reason            report_reason  NOT NULL,
  description       TEXT,
  status            report_status  NOT NULL DEFAULT 'pending',
  resolved_by       UUID           REFERENCES admin_users(id) ON DELETE SET NULL,
  resolution_notes  TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- ADDITIONAL: CONTENT MANAGEMENT
-- ============================================================================

CREATE TABLE faq_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         UUID           REFERENCES agencies(id) ON DELETE CASCADE,  -- NULL = platform-wide
  question          TEXT           NOT NULL,
  question_ar       TEXT,
  question_am       TEXT,
  answer            TEXT           NOT NULL,
  answer_ar         TEXT,
  answer_am         TEXT,
  target_audience   announcement_target NOT NULL DEFAULT 'all',
  sort_order        INTEGER        NOT NULL DEFAULT 0,
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE terms_and_policies (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id         UUID           REFERENCES agencies(id) ON DELETE CASCADE,  -- NULL = platform-wide
  type              VARCHAR(50)    NOT NULL, -- terms_of_service | privacy_policy | refund_policy | cookie_policy
  title             VARCHAR(255)   NOT NULL,
  title_ar          VARCHAR(255),
  title_am          VARCHAR(255),
  content           TEXT           NOT NULL,
  content_ar        TEXT,
  content_am        TEXT,
  version           VARCHAR(20)    NOT NULL DEFAULT '1.0',
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- INDEXES — Critical Performance
-- ============================================================================

-- Multi-tenancy — most queries filter by agency
CREATE INDEX idx_candidates_agency          ON candidates(agency_id, is_active);
CREATE INDEX idx_vacancies_agency           ON job_vacancies(agency_id, status);
CREATE INDEX idx_admin_users_agency         ON admin_users(agency_id);
CREATE INDEX idx_agency_subscriptions_agency ON agency_subscriptions(agency_id, status);

-- Browsing performance
CREATE INDEX idx_candidates_featured        ON candidates(agency_id, is_featured, is_active);
CREATE INDEX idx_candidates_category        ON candidate_categories(category_id);
CREATE INDEX idx_vacancies_country          ON job_vacancies(destination_country, status);
CREATE INDEX idx_vacancies_featured         ON job_vacancies(agency_id, is_featured, status);
CREATE INDEX idx_categories_parent          ON categories(parent_id);
CREATE INDEX idx_categories_type            ON categories(type, is_active);

-- Auth lookups
CREATE INDEX idx_users_phone                ON users(phone);
CREATE INDEX idx_users_email                ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_admin_users_email          ON admin_users(email);
CREATE INDEX idx_otp_identifier             ON otp_verifications(identifier, identifier_type, purpose);
CREATE INDEX idx_sessions_refresh           ON user_sessions(refresh_token) WHERE is_revoked = false;

-- Engagement
CREATE INDEX idx_applications_vacancy       ON applications(vacancy_id, status);
CREATE INDEX idx_applications_user          ON applications(user_id);
CREATE INDEX idx_applications_agency        ON applications(agency_id, status);
CREATE INDEX idx_inquiries_candidate        ON candidate_inquiries(candidate_id, status);
CREATE INDEX idx_inquiries_agency           ON candidate_inquiries(agency_id, status);
CREATE INDEX idx_saved_candidates_user      ON saved_candidates(user_id);
CREATE INDEX idx_saved_vacancies_user       ON saved_vacancies(user_id);

-- Pipeline
CREATE INDEX idx_pipeline_candidate         ON hiring_pipelines(candidate_id, is_active);
CREATE INDEX idx_pipeline_stage             ON hiring_pipelines(agency_id, current_stage);
CREATE INDEX idx_pipeline_history           ON pipeline_stage_history(pipeline_id, entered_at);

-- Communication
CREATE INDEX idx_conversations_user         ON conversations(user_id, agency_id);
CREATE INDEX idx_conversations_agency       ON conversations(agency_id, is_archived);
CREATE INDEX idx_messages_conversation      ON messages(conversation_id, sent_at);
CREATE INDEX idx_notifications_user         ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_admin        ON notifications(admin_user_id, is_read);

-- Analytics (high volume, keep lean)
CREATE INDEX idx_candidate_views_candidate  ON candidate_views(candidate_id, viewed_at);
CREATE INDEX idx_vacancy_views_vacancy      ON vacancy_views(vacancy_id, viewed_at);
CREATE INDEX idx_contact_clicks_agency      ON contact_click_logs(agency_id, clicked_at);
CREATE INDEX idx_activity_logs_agency       ON activity_logs(agency_id, created_at);
CREATE INDEX idx_activity_logs_entity       ON activity_logs(entity_type, entity_id);

-- Payments
CREATE INDEX idx_payments_agency            ON payment_transactions(agency_id, status);
CREATE INDEX idx_invoices_agency            ON invoices(agency_id, status);

-- Moderation
CREATE INDEX idx_blocked_users_agency       ON blocked_users(agency_id, user_id);
CREATE INDEX idx_reports_status             ON reports(status, created_at);


-- ============================================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================================

CREATE TRIGGER set_updated_at_subscription_plans
  BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_agencies
  BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_agency_subscriptions
  BEFORE UPDATE ON agency_subscriptions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_payment_transactions
  BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_invoices
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_admin_users
  BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_device_tokens
  BEFORE UPDATE ON device_tokens FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_user_jobseeker_profiles
  BEFORE UPDATE ON user_jobseeker_profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_user_employer_profiles
  BEFORE UPDATE ON user_employer_profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_candidates
  BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_job_vacancies
  BEFORE UPDATE ON job_vacancies FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_applications
  BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_candidate_inquiries
  BEFORE UPDATE ON candidate_inquiries FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_hiring_pipelines
  BEFORE UPDATE ON hiring_pipelines FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_conversations
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_agency_settings
  BEFORE UPDATE ON agency_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_blocked_users_noop  -- no updated_at but keeping for consistency
  BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_faq_items
  BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_terms_and_policies
  BEFORE UPDATE ON terms_and_policies FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_system_announcements
  BEFORE UPDATE ON system_announcements FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================================
-- TRIGGERS — denormalized counter increments
-- ============================================================================

-- Increment candidates.view_count when a candidate_view is inserted
CREATE OR REPLACE FUNCTION trigger_increment_candidate_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE candidates SET view_count = view_count + 1 WHERE id = NEW.candidate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_candidate_views
  AFTER INSERT ON candidate_views FOR EACH ROW EXECUTE FUNCTION trigger_increment_candidate_views();

-- Increment candidates.inquiry_count when a candidate_inquiry is inserted
CREATE OR REPLACE FUNCTION trigger_increment_candidate_inquiries()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE candidates SET inquiry_count = inquiry_count + 1 WHERE id = NEW.candidate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_candidate_inquiries
  AFTER INSERT ON candidate_inquiries FOR EACH ROW EXECUTE FUNCTION trigger_increment_candidate_inquiries();

-- Increment job_vacancies.view_count when a vacancy_view is inserted
CREATE OR REPLACE FUNCTION trigger_increment_vacancy_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE job_vacancies SET view_count = view_count + 1 WHERE id = NEW.vacancy_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_vacancy_views
  AFTER INSERT ON vacancy_views FOR EACH ROW EXECUTE FUNCTION trigger_increment_vacancy_views();

-- Increment job_vacancies.application_count when an application is inserted
CREATE OR REPLACE FUNCTION trigger_increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE job_vacancies SET application_count = application_count + 1 WHERE id = NEW.vacancy_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_application_count
  AFTER INSERT ON applications FOR EACH ROW EXECUTE FUNCTION trigger_increment_application_count();


COMMIT;
