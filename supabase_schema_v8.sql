-- ============================================================
-- A.ing Website - Supabase Schema v8
-- 2026-03-19
-- 변경 내용:
--   1. activities.type → competition, seminar 추가
--   2. activities 테이블 신규 컬럼 추가
--   3. ops_members 테이블 신규 생성
--   4. ex_ops_members 테이블 신규 생성
-- ============================================================

-- 1. activities.type check constraint 업데이트
--    기존 constraint 제거 후 재생성
alter table public.activities
  drop constraint if exists activities_type_check;

alter table public.activities
  add constraint activities_type_check
  check (type in ('study', 'project', 'event', 'competition', 'seminar'));

-- 2. activities 신규 컬럼 추가
alter table public.activities
  add column if not exists detail_url text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists participants integer,
  add column if not exists result text,
  add column if not exists image_url text;

-- 3. ops_members 테이블 생성 (운영진 조직도)
create table if not exists public.ops_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  responsibilities text default '',
  level text not null check (level in ('president', 'vp', 'lead', 'member')),
  "order" integer default 0,
  generation integer default 1,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.ops_members enable row level security;

create policy "Public read ops_members" on public.ops_members
  for select using (true);

create policy "Anon insert ops_members" on public.ops_members
  for insert with check (true);

create policy "Anon update ops_members" on public.ops_members
  for update using (true);

create policy "Anon delete ops_members" on public.ops_members
  for delete using (true);

-- 4. ex_ops_members 테이블 생성 (역대 운영진)
create table if not exists public.ex_ops_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  generation text not null,
  term text not null,
  description text default '',
  created_at timestamptz default now()
);

alter table public.ex_ops_members enable row level security;

create policy "Public read ex_ops_members" on public.ex_ops_members
  for select using (true);

create policy "Anon insert ex_ops_members" on public.ex_ops_members
  for insert with check (true);

create policy "Anon update ex_ops_members" on public.ex_ops_members
  for update using (true);

create policy "Anon delete ex_ops_members" on public.ex_ops_members
  for delete using (true);
