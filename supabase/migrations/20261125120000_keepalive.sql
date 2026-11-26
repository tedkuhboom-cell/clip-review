-- Clip Review: keep-alive.
-- Supabase pauses a free project that sees no database activity for about a week. The app only talks to
-- Supabase for opt-in extras, so a quiet week is normal. A scheduled GitHub job (.github/workflows/keepalive.yml)
-- calls keepalive_ping() once a day, which is a real database write.
-- No user data is involved: one row holding the time of the last ping and a counter.

create table public.keepalive (
  id         smallint primary key default 1 check (id = 1),
  pinged_at  timestamptz not null default now(),
  pings      bigint not null default 0
);
insert into public.keepalive (id) values (1);

-- Stamps the single row and returns the time. This is the only thing the public key can do here.
create function public.keepalive_ping()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update keepalive set pinged_at = now(), pings = pings + 1 where id = 1 returning pinged_at;
$$;

alter table public.keepalive enable row level security;
revoke all on public.keepalive from anon, authenticated;
revoke all on function public.keepalive_ping() from public, anon, authenticated;
grant execute on function public.keepalive_ping() to anon, service_role;
-- No policies: the public key can't read or change the row except through keepalive_ping().
