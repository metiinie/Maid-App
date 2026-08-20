-- ============================================================================
-- Seed Data: Subscription Plans
-- ============================================================================

INSERT INTO subscription_plans (
  id, name, description, price, billing_cycle,
  max_candidates, max_job_postings, max_admin_users, features, is_active
) VALUES
(
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Starter Agency',
  'Essential features for small recruitment agencies getting started.',
  99.00,
  'monthly',
  50,
  10,
  3,
  '{"custom_branding": false, "priority_support": false, "analytics_dashboard": true, "unlimited_inquiries": false}',
  true
),
(
  'a1b2c3d4-0002-4000-8000-000000000002',
  'Professional Agency',
  'Comprehensive toolkit for growing recruitment agencies.',
  249.00,
  'monthly',
  250,
  50,
  10,
  '{"custom_branding": true, "priority_support": true, "analytics_dashboard": true, "unlimited_inquiries": true}',
  true
),
(
  'a1b2c3d4-0003-4000-8000-000000000003',
  'Enterprise Agency',
  'Unlimited capacity and dedicated support for large operations.',
  499.00,
  'monthly',
  -1,
  -1,
  25,
  '{"custom_branding": true, "priority_support": true, "analytics_dashboard": true, "unlimited_inquiries": true, "api_access": true, "dedicated_manager": true}',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  features = EXCLUDED.features;
