-- A.ing Website Schema v6
-- LinkedIn 컬럼 추가
-- Run this in Supabase SQL Editor

alter table public.members add column if not exists linkedin text;
