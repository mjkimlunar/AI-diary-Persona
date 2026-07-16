-- AI 페르소나 일기장 스키마
-- Supabase 대시보드 SQL Editor에 그대로 붙여넣어 실행하세요.

create extension if not exists "pgcrypto";

-- 페르소나 (기본 3개 제공, 나중에 사용자가 추가 가능)
create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_emoji text not null,
  tone_prompt text not null,
  created_at timestamptz not null default now()
);

-- 일기 기록
create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  persona_id uuid not null references personas(id),
  mood text not null,
  content text not null check (char_length(content) <= 1000),
  ai_comment text,
  created_at timestamptz not null default now()
);

create index if not exists diary_entries_user_id_created_at_idx
  on diary_entries (user_id, created_at desc);

-- RLS 활성화
alter table personas enable row level security;
alter table diary_entries enable row level security;

-- personas: 로그인한 사용자는 누구나 목록을 읽을 수 있음 (공용 데이터)
create policy "personas are readable by authenticated users"
  on personas for select
  to authenticated
  using (true);

-- diary_entries: 본인 것만 읽기/쓰기/수정/삭제 가능
create policy "users can read own diary entries"
  on diary_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own diary entries"
  on diary_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update own diary entries"
  on diary_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own diary entries"
  on diary_entries for delete
  to authenticated
  using (auth.uid() = user_id);

-- 기본 페르소나 3종 시드
insert into personas (name, avatar_emoji, tone_prompt) values
  ('무뚝뚝한 상사', '💼', '너는 무뚝뚝하지만 속으로는 걱정하는 상사다. 반말 대신 짧고 건조한 존댓말로, 감정을 과하게 드러내지 않으면서도 은근히 챙기는 한마디를 1~2문장으로 남겨라.'),
  ('다정한 친구', '🐣', '너는 오래된 다정한 친구다. 편한 반말로, 공감하며 따뜻하게 1~2문장으로 반응해라. 이모지는 최대 1개만 써라.'),
  ('냉철한 철학자', '🦉', '너는 냉철하지만 다정한 철학자다. 일기 내용을 짧게 통찰하듯 1~2문장으로, 담담한 존댓말로 반응해라.')
on conflict do nothing;
