-- ============================================================
-- A.ing Website - Supabase Schema v9
-- 2026-03-19
-- ============================================================

-- 1. activities 테이블에 participants_type, participants_max 컬럼 추가
alter table public.activities
  add column if not exists participants_type text default 'single'
    check (participants_type in ('single', 'min', 'max', 'range')),
  add column if not exists participants_min integer,
  add column if not exists participants_max integer;

-- 2. activity_awards: competition 수상자 태그 테이블
create table if not exists public.activity_awards (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.activities(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  rank text not null check (rank in ('1st', '2nd', '3rd', 'special', 'participation')),
  note text,
  created_at timestamptz default now()
);
alter table public.activity_awards enable row level security;
create policy "Public read awards" on public.activity_awards for select using (true);
create policy "Anon insert awards" on public.activity_awards for insert with check (true);
create policy "Anon update awards" on public.activity_awards for update using (true);
create policy "Anon delete awards" on public.activity_awards for delete using (true);

-- 3. site_settings 확장 시드
insert into public.site_settings (key, value) values
  ('instagram', 'https://instagram.com/aing_gc'),
  ('notion', ''),
  ('recruit_open', 'false'),
  ('recruit_url', ''),
  ('home_hero_title', 'Theory to Code.
Code to Insight.'),
  ('home_hero_subtitle', '인공지능의 이론적 토대를 견고히 다지고, 직접 구현하며 지식을 체화하는 학부생 주도 AI 학술 동아리.'),
  ('semester_current', '2026 Spring'),
  ('max_members', '30'),
  ('footer_text', 'A.ing © 2026. Gachon University AI Academic Club.')
on conflict (key) do nothing;

-- 4. 더미 멤버 데이터 (test1~test5)
insert into public.members (name, role, track, semester, bio, is_active, interests, status)
values
  ('test1', 'Junior Researcher', 'junior', '2026 Spring', 'CV/NLP 공부 중인 주니어 멤버입니다.', true, ARRAY['CV', 'NLP'], 'free'),
  ('test2', 'Senior Researcher', 'senior', '2026 Spring', 'RL과 On-Device AI에 관심 있습니다.', true, ARRAY['RL', 'CV'], 'mid'),
  ('test3', 'Junior Researcher', 'junior', '2026 Spring', 'Transformer 스터디 참여 중입니다.', true, ARRAY['NLP', 'Transformer'], 'free'),
  ('test4', 'Senior Researcher', 'senior', '2026 Spring', 'Vision 모델 최적화 연구 중입니다.', true, ARRAY['CV', 'Optimization'], 'busy'),
  ('test5', 'Junior Researcher', 'junior', '2026 Spring', '처음 AI 공부를 시작했습니다.', true, ARRAY['NLP'], 'free')
on conflict do nothing;
