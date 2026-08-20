-- ============================================================================
-- Seed Data: Job & Skill Categories
-- ============================================================================

-- Parent Categories
INSERT INTO categories (id, name, name_ar, name_am, description, type, sort_order, is_active) VALUES
(
  'c0000000-0001-4000-8000-000000000001',
  'Domestic Worker',
  'عاملة منزلية',
  'የቤት ሠራተኛ',
  'Housekeeping, cooking, nanny, and elderly care services.',
  'job',
  1,
  true
),
(
  'c0000000-0002-4000-8000-000000000002',
  'Driver',
  'سائق',
  'አሽከርካሪ',
  'Personal and commercial vehicle driving services.',
  'job',
  2,
  true
),
(
  'c0000000-0003-4000-8000-000000000003',
  'Cook / Chef',
  'طباخ',
  'ወካይ / ምግብ አበሳይ',
  'Domestic and commercial food preparation.',
  'job',
  3,
  true
),
(
  'c0000000-0004-4000-8000-000000000004',
  'Security Guard',
  'حارس أمن',
  'የደህንነት ጥበቃ',
  'Residential and commercial premises security.',
  'job',
  4,
  true
),
(
  'c0000000-0005-4000-8000-000000000005',
  'Healthcare & Nursing',
  'رعاية صحية وتمريض',
  'የጤና እንክብካቤ እና ነርስ',
  'Certified nursing, patient care, and medical assistant roles.',
  'job',
  5,
  true
),
(
  'c0000000-0006-4000-8000-000000000006',
  'Cleaner & Janitor',
  'عامل تنظيف',
  'ጽዳት ሠራተኛ',
  'Commercial building and office maintenance.',
  'job',
  6,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  name_am = EXCLUDED.name_am;

-- Subcategories under Domestic Worker
INSERT INTO categories (id, name, name_ar, name_am, parent_id, type, sort_order, is_active) VALUES
(
  'c0000000-0010-4000-8000-000000000010',
  'Housemaid',
  'خادمة منزلية',
  'የቤት ሠራተኛ',
  'c0000000-0001-4000-8000-000000000001',
  'job',
  1,
  true
),
(
  'c0000000-0011-4000-8000-000000000011',
  'Nanny / Childcare',
  'مربية الأطفال',
  'የሕፃናት እያፊ',
  'c0000000-0001-4000-8000-000000000001',
  'job',
  2,
  true
),
(
  'c0000000-0012-4000-8000-000000000012',
  'Elderly Care Assistant',
  'رعاية كبار السن',
  'የአረጋውያን እንክብካቤ',
  'c0000000-0001-4000-8000-000000000001',
  'job',
  3,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  name_am = EXCLUDED.name_am;
