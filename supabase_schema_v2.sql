-- ============================================================
-- A.ing Website - Supabase Schema v2
-- 실행 전: Supabase Dashboard > SQL Editor 에서 붙여넣기 후 실행
-- ============================================================

-- Activities table
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  semester text not null,
  title text not null,
  type text not null check (type in ('study', 'project', 'event')),
  description text,
  tags text[] default '{}',
  github text,
  status text default 'ongoing' check (status in ('ongoing', 'completed', 'upcoming')),
  created_at timestamptz default now()
);

alter table public.activities enable row level security;

create policy "Public read activities" on public.activities
  for select using (true);

create policy "Anon insert activities" on public.activities
  for insert with check (true);

create policy "Anon update activities" on public.activities
  for update using (true);

create policy "Anon delete activities" on public.activities
  for delete using (true);

-- Site settings table
create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value text,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

create policy "Public read settings" on public.site_settings
  for select using (true);

create policy "Anon write settings" on public.site_settings
  for insert with check (true);

create policy "Anon update settings" on public.site_settings
  for update using (true);

-- Seed settings
insert into public.site_settings (key, value) values
  ('tagline', 'Theory to Code. Code to Insight.'),
  ('description', '인공지능의 이론적 토대를 견고히 다지고, 직접 구현하며 지식을 체화하는 학부생 주도 AI 학술 동아리.'),
  ('email', 'gachon.aing@gmail.com'),
  ('github', 'https://github.com/aing-gachon'),
  ('location', '가천대학교 AI관')
on conflict (key) do nothing;

-- Seed activities
insert into public.activities (semester, title, type, description, tags, github, status) values
  ('2026 Spring', 'ResNet Study', 'study', 'ResNet-50 논문 분석 및 PyTorch 구현', ARRAY['CV', 'ResNet', 'PyTorch'], 'https://github.com/aing-gachon/26-Spring-ResNet-Study', 'ongoing'),
  ('2026 Spring', 'Transformer Study', 'study', 'Attention is All You Need 구현', ARRAY['NLP', 'Transformer', 'Attention'], 'https://github.com/aing-gachon/26-Spring-Transformer-Study', 'ongoing'),
  ('2026 Spring', 'Senior Session', 'project', 'CV/NLP/RL 팀별 SOTA 모델 커스터마이징', ARRAY['Senior', 'Project', 'Research'], 'https://github.com/aing-gachon/26-Spring-Senior-Session', 'ongoing');
