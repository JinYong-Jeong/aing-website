-- members 테이블에 새 컬럼 추가
alter table public.members add column if not exists password_hash text;
alter table public.members add column if not exists interests text[] default '{}';
alter table public.members add column if not exists workload int default 0 check (workload between 0 and 5);
alter table public.members add column if not exists status text default 'active' check (status in ('active', 'busy', 'open'));
alter table public.members add column if not exists skills text[] default '{}';
alter table public.members add column if not exists looking_for_team boolean default false;
alter table public.members add column if not exists project_idea text;
alter table public.members add column if not exists contact_kakao text;
alter table public.members add column if not exists contact_email text;

-- Team posts table (팀원 모집 게시판)
create table if not exists public.team_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.members(id) on delete cascade,
  title text not null,
  description text not null,
  required_skills text[] default '{}',
  max_members int default 4,
  current_members int default 1,
  status text default 'open' check (status in ('open', 'closed')),
  contact text,
  created_at timestamptz default now()
);

alter table public.team_posts enable row level security;
create policy "Public read team_posts" on public.team_posts for select using (true);
create policy "Anon insert team_posts" on public.team_posts for insert with check (true);
create policy "Anon update team_posts" on public.team_posts for update using (true);
create policy "Anon delete team_posts" on public.team_posts for delete using (true);

-- Allow members update (for profile self-edit)
create policy "Anon update members profile" on public.members for update using (true);
