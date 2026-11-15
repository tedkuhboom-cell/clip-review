-- Clip Review: first backend tables.
-- The app has no accounts. Each install sends a random install_id so rows from one phone can be grouped,
-- but nothing identifies the person. The public (anon/publishable) key can only INSERT: it can't read,
-- change or delete anything. Reading happens from the dashboard or with the secret key (e.g. a weekly review job).

-- Grader appeals: "the grader missed something I said". Used to tune each card's key points.
create table public.appeals (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  install_id   uuid not null,
  app_version  text check (char_length(app_version) <= 40),
  pack         text check (char_length(pack) <= 40),
  card_id      text not null check (char_length(card_id) <= 20),
  from_grade   text check (from_grade in ('got','shaky','miss')),
  to_grade     text check (to_grade in ('got','shaky','miss')),
  points       text[] not null default '{}' check (cardinality(points) <= 20),
  answer       text check (char_length(answer) <= 4000),
  note         text check (char_length(note) <= 2000),
  full_answer  boolean not null default false,
  client_ts    timestamptz
);
create index appeals_card_idx on public.appeals (card_id, created_at desc);

-- Crash reports: what the red "Something on this page broke" box shows, sent so we hear about it.
create table public.client_errors (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  install_id   uuid not null,
  app_version  text check (char_length(app_version) <= 40),
  pack         text check (char_length(pack) <= 40),
  message      text not null check (char_length(message) <= 1000),
  stack        text check (char_length(stack) <= 4000),
  screen       text check (char_length(screen) <= 80),
  user_agent   text check (char_length(user_agent) <= 400),
  client_ts    timestamptz
);
create index client_errors_created_idx on public.client_errors (created_at desc);

-- Lock down: row level security on, and the public roles get INSERT only.
alter table public.appeals       enable row level security;
alter table public.client_errors enable row level security;

revoke all on public.appeals, public.client_errors from anon, authenticated;
grant insert on public.appeals, public.client_errors to anon, authenticated;

create policy "app can add appeals" on public.appeals
  for insert to anon, authenticated with check (true);
create policy "app can add error reports" on public.client_errors
  for insert to anon, authenticated with check (true);
-- No SELECT / UPDATE / DELETE policies: the public key can't read or change rows.
