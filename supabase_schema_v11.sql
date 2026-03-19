-- A.ing Website - Supabase Schema v11
-- 2026-03-19
-- 비밀번호를 Supabase Auth (pgcrypto) 해싱으로 전환
-- ⚠️ 실행 전 주의: 기존 평문 비밀번호가 있다면 모두 초기화됩니다.
-- 실행 순서: 1) 이 SQL 실행 → 2) admin에서 비밀번호 재설정

-- pgcrypto 확장 활성화 (이미 있으면 skip)
create extension if not exists pgcrypto;

-- users 테이블 password_hash 컬럼을 bcrypt 해시로 업데이트하는 함수
create or replace function hash_password(plain_password text)
returns text
language sql
immutable
as $$
  select crypt(plain_password, gen_salt('bf', 10));
$$;

-- 비밀번호 검증 함수
create or replace function verify_password(plain_password text, hashed text)
returns boolean
language sql
immutable
as $$
  select crypt(plain_password, hashed) = hashed;
$$;

-- 기존 평문 비밀번호를 bcrypt로 일괄 변환
-- (평문이 '$2'로 시작하지 않는 경우만 변환)
update public.users
set password_hash = crypt(password_hash, gen_salt('bf', 10))
where password_hash not like '$2%';

-- RPC: 로그인 검증 (프론트에서 호출)
create or replace function check_user_password(p_name text, p_password text)
returns table (
  id uuid,
  name text,
  role text,
  member_id uuid
)
language plpgsql
security definer
as $$
begin
  return query
    select u.id, u.name, u.role::text, u.member_id
    from public.users u
    where u.name = p_name
      and crypt(p_password, u.password_hash) = u.password_hash;
end;
$$;

-- 비밀번호 변경 RPC (admin 전용 - service_role key 필요)
create or replace function set_user_password(p_id uuid, p_new_password text)
returns void
language plpgsql
security definer
as $$
begin
  update public.users
  set password_hash = crypt(p_new_password, gen_salt('bf', 10))
  where id = p_id;
end;
$$;

-- RLS: check_user_password는 anon도 호출 가능 (로그인용)
grant execute on function check_user_password(text, text) to anon, authenticated;
-- set_user_password는 authenticated만 (admin 로그인 후 호출)
grant execute on function set_user_password(uuid, text) to authenticated;
