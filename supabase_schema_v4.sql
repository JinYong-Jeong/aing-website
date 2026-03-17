-- Projects table (진행중/예정/완료 프로젝트 모두)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text default 'study' check (type in ('study', 'project', 'research', 'competition')),
  status text default 'planned' check (status in ('planned', 'ongoing', 'completed', 'archived')),
  semester text,
  start_date date,
  end_date date,
  tags text[] default '{}',
  github text,
  demo_url text,
  thumbnail_url text,
  outcome text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project members (참여 멤버)
create table if not exists public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(project_id, member_id)
);

alter table public.projects enable row level security;
alter table public.project_members enable row level security;

create policy "Public read projects" on public.projects for select using (true);
create policy "Anon insert projects" on public.projects for insert with check (true);
create policy "Anon update projects" on public.projects for update using (true);
create policy "Anon delete projects" on public.projects for delete using (true);

create policy "Public read project_members" on public.project_members for select using (true);
create policy "Anon insert project_members" on public.project_members for insert with check (true);
create policy "Anon update project_members" on public.project_members for update using (true);
create policy "Anon delete project_members" on public.project_members for delete using (true);

-- Seed projects (기존 활동 기록)
insert into public.projects (title, description, type, status, semester, tags, github) values
  ('ResNet Study', 'ResNet-50 논문 분석 및 PyTorch 직접 구현', 'study', 'ongoing', '2026 Spring', ARRAY['CV', 'ResNet', 'PyTorch'], 'https://github.com/aing-gachon/26-Spring-ResNet-Study'),
  ('Transformer Study', 'Attention is All You Need 논문 구현', 'study', 'ongoing', '2026 Spring', ARRAY['NLP', 'Transformer', 'Attention'], 'https://github.com/aing-gachon/26-Spring-Transformer-Study'),
  ('Senior Session 26 Spring', 'CV/NLP/RL 팀별 SOTA 모델 커스터마이징 프로젝트', 'project', 'ongoing', '2026 Spring', ARRAY['Senior', 'CV', 'NLP', 'RL'], 'https://github.com/aing-gachon/26-Spring-Senior-Session');
