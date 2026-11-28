-- Schema cho Fish Upon The Sky trên Supabase
-- Chạy toàn bộ file này trong Supabase Dashboard -> SQL Editor

create table if not exists public.member_accounts (
  member_id text primary key check (member_id in ('bao', 'hang', 'diem', 'quynh', 'quoc-anh', 'thu', 'thien')),
  email text unique,
  clerk_user_id text unique
);

alter table public.member_accounts enable row level security;
-- Không tạo policy trên member_accounts: chỉ đọc qua hàm security definer current_member_id()

create or replace function public.current_member_id() returns text
language sql stable security definer set search_path = public as $$
  select member_id from public.member_accounts
  where (clerk_user_id is not null and clerk_user_id = auth.jwt()->>'sub')
     or (
       email is not null
       and lower(email) = lower(auth.jwt()->>'email')
       and coalesce(auth.jwt()->'app_metadata'->>'provider', '') = 'google'
     )
  limit 1
$$;

revoke execute on function public.current_member_id() from public, anon;
grant execute on function public.current_member_id() to authenticated;

create table if not exists public.member_profiles (
  member_id text primary key check (member_id in ('bao', 'hang', 'diem', 'quynh', 'quoc-anh', 'thu', 'thien')),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.polls (
  id text primary key,
  data jsonb not null,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_votes (
  poll_id text not null references public.polls(id) on delete cascade,
  member_id text not null check (member_id in ('bao', 'hang', 'diem', 'quynh', 'quoc-anh', 'thu', 'thien')),
  kind text not null check (kind in ('votes', 'placeVotes', 'budgetVotes')),
  option text not null,
  created_at timestamptz not null default now(),
  primary key (poll_id, member_id, kind, option)
);

create table if not exists public.outings (
  id text primary key,
  data jsonb not null,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.busy_days (
  member_id text not null check (member_id in ('bao', 'hang', 'diem', 'quynh', 'quoc-anh', 'thu', 'thien')),
  day date not null,
  primary key (member_id, day)
);

create table if not exists public.ripples (
  id text primary key,
  member_id text not null check (member_id in ('bao', 'hang', 'diem', 'quynh', 'quoc-anh', 'thu', 'thien')),
  image_url text not null,
  caption text not null default '',
  place text not null default '',
  trip_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.ripple_reactions (
  ripple_id text not null references public.ripples(id) on delete cascade,
  member_id text not null check (member_id in ('bao', 'hang', 'diem', 'quynh', 'quoc-anh', 'thu', 'thien')),
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (ripple_id, member_id, emoji)
);

create table if not exists public.ripple_notes (
  id text primary key,
  ripple_id text not null references public.ripples(id) on delete cascade,
  member_id text not null check (member_id in ('bao', 'hang', 'diem', 'quynh', 'quoc-anh', 'thu', 'thien')),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.member_profiles enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.outings enable row level security;
alter table public.busy_days enable row level security;
alter table public.ripples enable row level security;
alter table public.ripple_reactions enable row level security;
alter table public.ripple_notes enable row level security;

-- SELECT policies: chỉ thành viên đã liên kết được đọc
drop policy if exists "members_select_profiles" on public.member_profiles;
create policy "members_select_profiles" on public.member_profiles
  for select to authenticated
  using (public.current_member_id() is not null);

drop policy if exists "members_select_polls" on public.polls;
create policy "members_select_polls" on public.polls
  for select to authenticated
  using (public.current_member_id() is not null);

drop policy if exists "members_select_poll_votes" on public.poll_votes;
create policy "members_select_poll_votes" on public.poll_votes
  for select to authenticated
  using (public.current_member_id() is not null);

drop policy if exists "members_select_outings" on public.outings;
create policy "members_select_outings" on public.outings
  for select to authenticated
  using (public.current_member_id() is not null);

drop policy if exists "members_select_busy_days" on public.busy_days;
create policy "members_select_busy_days" on public.busy_days
  for select to authenticated
  using (public.current_member_id() is not null);

-- member_profiles: chỉ chủ hồ sơ được sửa
drop policy if exists "owner_insert_profile" on public.member_profiles;
create policy "owner_insert_profile" on public.member_profiles
  for insert to authenticated
  with check (member_id = public.current_member_id());

drop policy if exists "owner_update_profile" on public.member_profiles;
create policy "owner_update_profile" on public.member_profiles
  for update to authenticated
  using (member_id = public.current_member_id())
  with check (member_id = public.current_member_id());

-- polls & outings: mọi thành viên đã liên kết được tạo/sửa/xóa
drop policy if exists "members_insert_polls" on public.polls;
create policy "members_insert_polls" on public.polls
  for insert to authenticated
  with check (public.current_member_id() is not null);

drop policy if exists "members_update_polls" on public.polls;
create policy "members_update_polls" on public.polls
  for update to authenticated
  using (public.current_member_id() is not null)
  with check (public.current_member_id() is not null);

drop policy if exists "members_delete_polls" on public.polls;
create policy "members_delete_polls" on public.polls
  for delete to authenticated
  using (public.current_member_id() is not null);

drop policy if exists "members_insert_outings" on public.outings;
create policy "members_insert_outings" on public.outings
  for insert to authenticated
  with check (public.current_member_id() is not null);

drop policy if exists "members_update_outings" on public.outings;
create policy "members_update_outings" on public.outings
  for update to authenticated
  using (public.current_member_id() is not null)
  with check (public.current_member_id() is not null);

drop policy if exists "members_delete_outings" on public.outings;
create policy "members_delete_outings" on public.outings
  for delete to authenticated
  using (public.current_member_id() is not null);

-- poll_votes & busy_days: chỉ sửa phần của chính mình
drop policy if exists "owner_insert_poll_votes" on public.poll_votes;
create policy "owner_insert_poll_votes" on public.poll_votes
  for insert to authenticated
  with check (member_id = public.current_member_id());

drop policy if exists "owner_delete_poll_votes" on public.poll_votes;
create policy "owner_delete_poll_votes" on public.poll_votes
  for delete to authenticated
  using (member_id = public.current_member_id());

drop policy if exists "owner_insert_busy_days" on public.busy_days;
create policy "owner_insert_busy_days" on public.busy_days
  for insert to authenticated
  with check (member_id = public.current_member_id());

drop policy if exists "owner_delete_busy_days" on public.busy_days;
create policy "owner_delete_busy_days" on public.busy_days
  for delete to authenticated
  using (member_id = public.current_member_id());

-- ripples, ripple_reactions, ripple_notes
drop policy if exists "members_select_ripples" on public.ripples;
create policy "members_select_ripples" on public.ripples
  for select to authenticated
  using (public.current_member_id() is not null);

drop policy if exists "owner_insert_ripples" on public.ripples;
create policy "owner_insert_ripples" on public.ripples
  for insert to authenticated
  with check (member_id = public.current_member_id());

drop policy if exists "owner_update_ripples" on public.ripples;
create policy "owner_update_ripples" on public.ripples
  for update to authenticated
  using (member_id = public.current_member_id())
  with check (member_id = public.current_member_id());

drop policy if exists "owner_delete_ripples" on public.ripples;
create policy "owner_delete_ripples" on public.ripples
  for delete to authenticated
  using (member_id = public.current_member_id());

drop policy if exists "members_select_ripple_reactions" on public.ripple_reactions;
create policy "members_select_ripple_reactions" on public.ripple_reactions
  for select to authenticated
  using (public.current_member_id() is not null);

drop policy if exists "owner_insert_ripple_reactions" on public.ripple_reactions;
create policy "owner_insert_ripple_reactions" on public.ripple_reactions
  for insert to authenticated
  with check (member_id = public.current_member_id());

drop policy if exists "owner_delete_ripple_reactions" on public.ripple_reactions;
create policy "owner_delete_ripple_reactions" on public.ripple_reactions
  for delete to authenticated
  using (member_id = public.current_member_id());

drop policy if exists "members_select_ripple_notes" on public.ripple_notes;
create policy "members_select_ripple_notes" on public.ripple_notes
  for select to authenticated
  using (public.current_member_id() is not null);

drop policy if exists "owner_insert_ripple_notes" on public.ripple_notes;
create policy "owner_insert_ripple_notes" on public.ripple_notes
  for insert to authenticated
  with check (member_id = public.current_member_id());

drop policy if exists "owner_delete_ripple_notes" on public.ripple_notes;
create policy "owner_delete_ripple_notes" on public.ripple_notes
  for delete to authenticated
  using (member_id = public.current_member_id());

-- Realtime publication (idempotent)
do $$
declare
  tbl text;
begin
  foreach tbl in array array['member_profiles', 'polls', 'poll_votes', 'outings', 'busy_days', 'ripples', 'ripple_reactions', 'ripple_notes']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end $$;

-- Storage bucket cho ảnh hồ sơ và Trip Vault
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "members_insert_media" on storage.objects;
create policy "members_insert_media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.current_member_id() is not null);

drop policy if exists "members_delete_media" on storage.objects;
create policy "members_delete_media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.current_member_id() is not null);
