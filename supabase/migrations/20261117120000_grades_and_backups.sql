-- Clip Review: Claude grading and automatic backups.
-- Both are reached only through Edge Functions, which use the secret (service role) key.
-- The public key gets nothing on these tables: no insert, no read.

-- Every answer Claude graded, with the result. Used to check and tune the grader.
create table public.grades (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  install_id    uuid not null,
  pack          text check (char_length(pack) <= 40),
  card_id       text not null check (char_length(card_id) <= 20),
  answer        text not null check (char_length(answer) <= 1500),
  result        jsonb not null,
  model         text check (char_length(model) <= 60),
  input_tokens  integer,
  output_tokens integer,
  ms            integer
);
create index grades_card_idx on public.grades (card_id, created_at desc);
create index grades_install_idx on public.grades (install_id, created_at desc);

-- How many answers each install has had graded per day (cost guard).
create table public.grade_usage (
  day         date not null,
  install_id  uuid not null,
  n           integer not null default 0,
  primary key (day, install_id)
);

-- Counts one graded answer. Returns false when the install or the whole app is over its daily limit.
create function public.grade_take(p_install uuid, p_per_install integer, p_global integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'utc')::date;
  mine integer;
  total integer;
begin
  select coalesce(sum(n), 0) into total from grade_usage where day = today;
  if total >= p_global then return false; end if;
  insert into grade_usage (day, install_id, n) values (today, p_install, 1)
    on conflict (day, install_id) do update set n = grade_usage.n + 1
    returning n into mine;
  return mine <= p_per_install;
end;
$$;

-- One backup per install: the same JSON the app's "Save a backup" button writes.
-- key_hash is the SHA-256 of a secret that only the phone knows (part of its restore code).
create table public.backups (
  install_id  uuid primary key,
  key_hash    text not null check (char_length(key_hash) = 64),
  data        jsonb not null,
  bytes       integer not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.grades      enable row level security;
alter table public.grade_usage enable row level security;
alter table public.backups     enable row level security;
revoke all on public.grades, public.grade_usage, public.backups from anon, authenticated;
revoke all on function public.grade_take(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.grade_take(uuid, integer, integer) to service_role;
-- No policies: only the service role (Edge Functions, dashboard) can touch these.
