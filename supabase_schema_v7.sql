-- team_applications: 팀원 참여 신청 테이블
create table if not exists public.team_applications (
  id uuid default gen_random_uuid() primary key,
  team_post_id uuid references public.team_posts(id) on delete cascade,
  applicant_id uuid references public.members(id) on delete cascade,
  applicant_name text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(team_post_id, applicant_id)
);

alter table public.team_applications enable row level security;
create policy "Public read applications" on public.team_applications for select using (true);
create policy "Anon insert applications" on public.team_applications for insert with check (true);
create policy "Anon update applications" on public.team_applications for update using (true);
create policy "Anon delete applications" on public.team_applications for delete using (true);
