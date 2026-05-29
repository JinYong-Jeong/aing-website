-- ============================================================
-- A.ing Website - Schema Final
-- 2026-05-28 security-focused version
-- Run in Supabase SQL Editor for a fresh deployment.
-- ============================================================

create extension if not exists pgcrypto;

create or replace function public.text_array_items_max_length(values text[], max_len int)
returns boolean
language sql
immutable
as $$
  select coalesce(bool_and(char_length(item) <= max_len), true)
  from unnest(values) as item
$$;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  track text not null check (track in ('junior', 'senior', 'admin', 'ob')),
  semester text not null,
  email text unique,
  github text,
  linkedin text,
  instagram text,
  avatar_url text,
  bio text,
  project_idea text,
  interests text[] default '{}',
  skills text[] default '{}',
  workload int default 0 check (workload between 0 and 5),
  status text default 'mid' check (status in ('busy', 'mid', 'free')),
  looking_for_team boolean default false,
  contact_info text,
  contact_email text,
  is_active boolean default true,
  generation int,
  "order" int default 99,
  created_at timestamptz default now(),
  constraint members_email_school_check check (
    email is null or lower(email) ~ '^[^@[:space:]]+@([a-z0-9-]+\.)*gachon\.ac\.kr$'
  ),
  constraint members_bio_length_check check (bio is null or char_length(bio) <= 300),
  constraint members_project_idea_length_check check (project_idea is null or char_length(project_idea) <= 500),
  constraint members_contact_length_check check (
    (contact_info is null or char_length(contact_info) <= 160)
    and (contact_email is null or char_length(contact_email) <= 160)
  )
);

create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  slug text unique,
  title text not null,
  type text not null check (type in ('study', 'project', 'competition', 'seminar')),
  semester text not null,
  description text,
  detail_content text,
  detail_url text,
  instagram_url text,
  github text,
  tags text[] default '{}',
  status text default 'ongoing' check (status in ('ongoing', 'completed', 'upcoming')),
  start_date date,
  end_date date,
  participants int,
  participants_type text default 'single' check (participants_type in ('single', 'min', 'max', 'range')),
  participants_min int,
  participants_max int,
  result text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.activity_awards (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.activities(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  rank text not null check (rank in ('1st','2nd','3rd','special','participation','honor_completion','completion')),
  note text,
  created_at timestamptz default now()
);

create table if not exists public.history_events (
  id uuid default gen_random_uuid() primary key,
  title text not null check (char_length(title) between 2 and 120),
  description text check (description is null or char_length(description) <= 1000),
  event_date date not null,
  category text not null default 'milestone' check (category in ('award', 'hackathon', 'project', 'event', 'milestone')),
  link_url text,
  image_url text,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text default 'project' check (type in ('study', 'project', 'research', 'competition')),
  status text default 'ongoing' check (status in ('planned', 'ongoing', 'completed', 'archived')),
  semester text,
  tags text[] default '{}',
  github text,
  demo_url text,
  thumbnail_url text,
  outcome text,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  role text,
  joined_at timestamptz default now()
);

create table if not exists public.team_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  author_id uuid not null references public.members(id) on delete cascade,
  author_name text,
  required_skills text[] default '{}',
  max_members int default 4,
  current_members int default 1,
  status text default 'open' check (status in ('open', 'closed')),
  contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint team_posts_title_length_check check (char_length(title) between 4 and 80),
  constraint team_posts_description_length_check check (char_length(description) between 20 and 1000),
  constraint team_posts_members_check check (max_members between 2 and 8 and current_members between 1 and max_members),
  constraint team_posts_contact_length_check check (contact is null or char_length(contact) <= 120),
  constraint team_posts_skills_count_check check (coalesce(array_length(required_skills, 1), 0) <= 8),
  constraint team_posts_skills_length_check check (public.text_array_items_max_length(required_skills, 24))
);

create table if not exists public.team_applications (
  id uuid default gen_random_uuid() primary key,
  team_post_id uuid references public.team_posts(id) on delete cascade,
  applicant_id uuid not null references public.members(id) on delete cascade,
  applicant_name text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(team_post_id, applicant_id),
  constraint team_applications_message_length_check check (message is null or char_length(message) <= 300)
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.ops_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  responsibilities text,
  level text default 'member' check (level in ('president', 'vp', 'lead', 'member')),
  "order" int default 99,
  generation int default 1,
  member_id uuid references public.members(id) on delete set null,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.ex_ops_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  generation int not null,
  track text,
  joined_at text,
  member_id uuid references public.members(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text,
  updated_at timestamptz default now()
);

-- Community board tables were removed on 2026-05-28.
-- Do not expose legacy posts.author_password or members.password_hash columns if they exist in an older database.
alter table if exists public.members drop column if exists password_hash;
alter table if exists public.posts drop column if exists author_password;

do $$
declare
  legacy_policy record;
begin
  for legacy_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('posts', 'comments')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      legacy_policy.policyname,
      legacy_policy.schemaname,
      legacy_policy.tablename
    );
  end loop;

  if to_regclass('public.posts') is not null then
    execute 'alter table public.posts enable row level security';
    execute 'revoke all on public.posts from anon, authenticated';
  end if;

  if to_regclass('public.comments') is not null then
    execute 'alter table public.comments enable row level security';
    execute 'revoke all on public.comments from anon, authenticated';
  end if;
end $$;

-- ============================================================
-- HELPERS
-- ============================================================

create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.id
  from public.members m
  where m.is_active = true
    and (
      lower(m.email) = lower(auth.jwt() ->> 'email')
      or lower(m.contact_email) = lower(auth.jwt() ->> 'email')
    )
  limit 1
$$;

create or replace function public.is_admin_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members m
    where m.is_active = true
      and (
        lower(m.email) = lower(auth.jwt() ->> 'email')
        or lower(m.contact_email) = lower(auth.jwt() ->> 'email')
      )
      and (
        m.track = 'admin'
        or m.role ~* '(ops|운영|회장|부회장|lead)'
      )
  )
$$;

create or replace function public.get_current_member()
returns table (
  id uuid,
  name text,
  role text,
  track text,
  email text,
  contact_email text,
  is_active boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select m.id, m.name, m.role, m.track, m.email, m.contact_email, m.is_active
  from public.members m
  where m.is_active = true
    and (
      lower(m.email) = lower(auth.jwt() ->> 'email')
      or lower(m.contact_email) = lower(auth.jwt() ->> 'email')
    )
  limit 1
$$;

create or replace function public.is_registered_member_email(input_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members m
    where m.is_active = true
      and (
        lower(m.email) = lower(input_email)
        or lower(m.contact_email) = lower(input_email)
      )
  )
$$;

grant execute on function public.get_current_member() to authenticated;
grant execute on function public.current_member_id() to authenticated;
grant execute on function public.is_admin_member() to authenticated;
grant execute on function public.is_registered_member_email(text) to anon, authenticated;

-- ============================================================
-- RLS
-- ============================================================

alter table public.members enable row level security;
alter table public.activities enable row level security;
alter table public.activity_awards enable row level security;
alter table public.history_events enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.team_posts enable row level security;
alter table public.team_applications enable row level security;
alter table public.messages enable row level security;
alter table public.ops_members enable row level security;
alter table public.ex_ops_members enable row level security;
alter table public.site_settings enable row level security;

-- Drop legacy permissive policies.
drop policy if exists "anon all members" on public.members;
drop policy if exists "anon all activities" on public.activities;
drop policy if exists "anon all activity_awards" on public.activity_awards;
drop policy if exists "anon all projects" on public.projects;
drop policy if exists "anon all project_members" on public.project_members;
drop policy if exists "anon all team_posts" on public.team_posts;
drop policy if exists "anon all team_applications" on public.team_applications;
drop policy if exists "anon all messages" on public.messages;
drop policy if exists "public insert team_applications" on public.team_applications;
drop policy if exists "public insert messages" on public.messages;

-- Members: registered members can read active profile fields; users can update themselves; admins can manage all.
drop policy if exists "authenticated read active members" on public.members;
create policy "authenticated read active members"
on public.members for select
to authenticated
using (is_active = true or public.is_admin_member());

drop policy if exists "members update self" on public.members;
create policy "members update self"
on public.members for update
to authenticated
using (id = public.current_member_id() or public.is_admin_member())
with check (id = public.current_member_id() or public.is_admin_member());

drop policy if exists "admins manage members" on public.members;
create policy "admins manage members"
on public.members for all
to authenticated
using (public.is_admin_member())
with check (public.is_admin_member());

-- Public read-only content.
drop policy if exists "public read activities" on public.activities;
create policy "public read activities" on public.activities for select to anon, authenticated using (true);
drop policy if exists "public read activity_awards" on public.activity_awards;
create policy "public read activity_awards" on public.activity_awards for select to anon, authenticated using (true);
drop policy if exists "public read history_events" on public.history_events;
create policy "public read history_events" on public.history_events for select to anon, authenticated using (true);
drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects for select to anon, authenticated using (true);
drop policy if exists "public read project_members" on public.project_members;
create policy "public read project_members" on public.project_members for select to anon, authenticated using (true);
drop policy if exists "public read ops_members" on public.ops_members;
create policy "public read ops_members" on public.ops_members for select to anon, authenticated using (true);
drop policy if exists "public read ex_ops_members" on public.ex_ops_members;
create policy "public read ex_ops_members" on public.ex_ops_members for select to anon, authenticated using (true);
drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings" on public.site_settings for select to anon, authenticated using (true);

-- Admin-managed public content.
drop policy if exists "admins manage activities" on public.activities;
create policy "admins manage activities" on public.activities for all to authenticated using (public.is_admin_member()) with check (public.is_admin_member());
drop policy if exists "admins manage activity_awards" on public.activity_awards;
create policy "admins manage activity_awards" on public.activity_awards for all to authenticated using (public.is_admin_member()) with check (public.is_admin_member());
drop policy if exists "admins manage history_events" on public.history_events;
create policy "admins manage history_events" on public.history_events for all to authenticated using (public.is_admin_member()) with check (public.is_admin_member());
drop policy if exists "admins manage projects" on public.projects;
create policy "admins manage projects" on public.projects for all to authenticated using (public.is_admin_member()) with check (public.is_admin_member());
drop policy if exists "admins manage project_members" on public.project_members;
create policy "admins manage project_members" on public.project_members for all to authenticated using (public.is_admin_member()) with check (public.is_admin_member());
drop policy if exists "admins manage ops_members" on public.ops_members;
create policy "admins manage ops_members" on public.ops_members for all to authenticated using (public.is_admin_member()) with check (public.is_admin_member());
drop policy if exists "admins manage ex_ops_members" on public.ex_ops_members;
create policy "admins manage ex_ops_members" on public.ex_ops_members for all to authenticated using (public.is_admin_member()) with check (public.is_admin_member());
drop policy if exists "admins manage site_settings" on public.site_settings;
create policy "admins manage site_settings" on public.site_settings for all to authenticated using (public.is_admin_member()) with check (public.is_admin_member());

-- Team posts: registered members only. Strong limits are enforced in checks and policies.
drop policy if exists "members read team_posts" on public.team_posts;
create policy "members read team_posts"
on public.team_posts for select
to authenticated
using (public.current_member_id() is not null);

drop policy if exists "members insert team_posts" on public.team_posts;
create policy "members insert team_posts"
on public.team_posts for insert
to authenticated
with check (
  author_id = public.current_member_id()
  and public.current_member_id() is not null
  and (
    select count(*)
    from public.team_posts tp
    where tp.author_id = public.current_member_id()
      and tp.status = 'open'
  ) < 3
  and (
    select count(*)
    from public.team_posts tp
    where tp.author_id = public.current_member_id()
      and tp.created_at > now() - interval '10 minutes'
  ) < 2
);

drop policy if exists "authors update team_posts" on public.team_posts;
create policy "authors update team_posts"
on public.team_posts for update
to authenticated
using (author_id = public.current_member_id() or public.is_admin_member())
with check (author_id = public.current_member_id() or public.is_admin_member());

drop policy if exists "authors delete team_posts" on public.team_posts;
create policy "authors delete team_posts"
on public.team_posts for delete
to authenticated
using (author_id = public.current_member_id() or public.is_admin_member());

-- Team applications: applicants see their own; authors/admins see applicants to their posts.
drop policy if exists "members read relevant team_applications" on public.team_applications;
create policy "members read relevant team_applications"
on public.team_applications for select
to authenticated
using (
  applicant_id = public.current_member_id()
  or public.is_admin_member()
  or exists (
    select 1
    from public.team_posts tp
    where tp.id = team_applications.team_post_id
      and tp.author_id = public.current_member_id()
  )
);

drop policy if exists "members insert team_applications" on public.team_applications;
create policy "members insert team_applications"
on public.team_applications for insert
to authenticated
with check (
  applicant_id = public.current_member_id()
  and exists (
    select 1
    from public.team_posts tp
    where tp.id = team_applications.team_post_id
      and tp.status = 'open'
      and tp.author_id <> public.current_member_id()
  )
  and not exists (
    select 1
    from public.team_applications ta
    where ta.applicant_id = public.current_member_id()
      and ta.created_at > now() - interval '1 minute'
  )
);

drop policy if exists "authors update team_applications" on public.team_applications;
create policy "authors update team_applications"
on public.team_applications for update
to authenticated
using (
  public.is_admin_member()
  or exists (
    select 1
    from public.team_posts tp
    where tp.id = team_applications.team_post_id
      and tp.author_id = public.current_member_id()
  )
)
with check (
  public.is_admin_member()
  or exists (
    select 1
    from public.team_posts tp
    where tp.id = team_applications.team_post_id
      and tp.author_id = public.current_member_id()
  )
);

-- Legacy contact messages: no public insert; admins only.
drop policy if exists "admins manage messages" on public.messages;
create policy "admins manage messages"
on public.messages for all
to authenticated
using (public.is_admin_member())
with check (public.is_admin_member());

-- Default settings.
insert into public.site_settings (key, value)
values
  ('email', 'gachon.aing@gmail.com'),
  ('footer_text', '© 2026 A.ing. All rights reserved.')
on conflict (key) do nothing;
