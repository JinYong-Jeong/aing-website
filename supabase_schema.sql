-- Members table
create table if not exists public.members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  track text not null check (track in ('junior', 'senior', 'admin')),
  semester text not null,
  github text,
  avatar_url text,
  bio text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Posts table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.members(id) on delete set null,
  category text not null check (category in ('notice', 'activity', 'study', 'project')),
  tags text[] default '{}',
  is_pinned boolean default false,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  author_name text not null,
  author_email text,
  content text not null,
  is_approved boolean default false,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now()
);

-- Contact messages table
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.contact_messages enable row level security;

create policy "Public read members" on public.members for select using (true);
create policy "Public read posts" on public.posts for select using (true);
create policy "Public read approved comments" on public.comments for select using (is_approved = true);
create policy "Public insert comments" on public.comments for insert with check (true);
create policy "Public insert contact" on public.contact_messages for insert with check (true);
create policy "Update post views" on public.posts for update using (true) with check (true);
create policy "Anon insert members" on public.members for insert with check (true);
create policy "Anon update members" on public.members for update using (true);
create policy "Anon delete members" on public.members for delete using (true);
create policy "Anon insert posts" on public.posts for insert with check (true);
create policy "Anon delete posts" on public.posts for delete using (true);
create policy "Anon update comments" on public.comments for update using (true);
create policy "Anon delete comments" on public.comments for delete using (true);
create policy "Anon read contact" on public.contact_messages for select using (true);
create policy "Anon update contact" on public.contact_messages for update using (true);
create policy "Anon delete contact" on public.contact_messages for delete using (true);

-- Seed members
insert into public.members (name, role, track, semester, github, bio, is_active) values
  ('송이두', 'President', 'admin', '2026 Spring', 'https://github.com/aing-gachon', 'A.ing 운영진', true),
  ('정진용', 'Researcher', 'senior', '2026 Spring', 'https://github.com/JinYong-Jeong', 'On-Device AI Agent, Federated Learning', true);

-- Seed post
insert into public.posts (title, content, category, tags, is_pinned, views) values
  ('[공지] 2026 Spring 신규 부원 모집 안내',
   '안녕하세요, A.ing입니다. 2026 Spring 학기 신규 부원을 모집합니다.',
   'notice', ARRAY['모집', '2026', 'Spring'], true, 0);
