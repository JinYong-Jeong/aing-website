-- A.ing Website - Supabase Schema v10
-- 2026-03-19
-- activities 테이블에 detail_content 컬럼 추가
alter table public.activities
  add column if not exists detail_content text;

-- slug 및 instagram_url 컬럼 추가 (v10 추가)
alter table public.activities
  add column if not exists slug text unique,
  add column if not exists instagram_url text;
