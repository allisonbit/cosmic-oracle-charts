-- ─────────────────────────────────────────────────────────────────────────────
-- Oracle Bull — full database schema for a fresh Supabase project
-- Paste this whole file into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent-ish: safe to re-run (uses IF NOT EXISTS / OR REPLACE).
-- After running: Authentication → Providers → Email → ON.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  email text,
  watchlist text[] not null default '{}',
  preferences jsonb not null default '{}'::jsonb,
  is_premium boolean not null default true,
  email_notifications boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── user_alerts (price alerts, My → Alerts) ─────────────────────────────────
create table if not exists public.user_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_id text not null,
  symbol text not null,
  target_price numeric not null,
  condition text not null check (condition in ('above', 'below')),
  note text,
  is_triggered boolean not null default false,
  triggered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists user_alerts_user_idx on public.user_alerts (user_id, created_at desc);

-- ── portfolio_holdings (My → Portfolio) ─────────────────────────────────────
create table if not exists public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_id text not null,
  symbol text not null,
  name text,
  quantity numeric not null default 0,
  buy_price numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists portfolio_holdings_user_idx on public.portfolio_holdings (user_id, created_at desc);

-- ── trade_journal (My → Journal) ────────────────────────────────────────────
create table if not exists public.trade_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_id text not null,
  symbol text not null,
  name text,
  trade_type text not null check (trade_type in ('long', 'short')),
  entry_price numeric not null,
  exit_price numeric,
  quantity numeric not null,
  fees numeric not null default 0,
  pnl numeric,
  pnl_percent numeric,
  status text not null default 'open' check (status in ('open', 'closed')),
  tags text[] not null default '{}',
  notes text,
  exited_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists trade_journal_user_idx on public.trade_journal (user_id, created_at desc);

-- ── dca_plans + dca_entries (My → DCA) ──────────────────────────────────────
create table if not exists public.dca_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_id text not null,
  symbol text not null,
  name text,
  amount_per_buy numeric not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  next_buy_date timestamptz not null,
  total_invested numeric not null default 0,
  total_units numeric not null default 0,
  avg_buy_price numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists dca_plans_user_idx on public.dca_plans (user_id, created_at desc);

create table if not exists public.dca_entries (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.dca_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  price_at_buy numeric not null,
  units_bought numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists dca_entries_plan_idx on public.dca_entries (plan_id, created_at desc);

-- ── user_predictions (My → Social, public feed) ─────────────────────────────
create table if not exists public.user_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_id text not null,
  symbol text not null,
  prediction_type text not null check (prediction_type in ('bullish', 'bearish', 'target')),
  target_price numeric not null,
  entry_price numeric not null,
  timeframe text not null,
  reasoning text,
  is_resolved boolean not null default false,
  was_correct boolean,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists user_predictions_recent_idx on public.user_predictions (created_at desc);
create index if not exists user_predictions_user_idx on public.user_predictions (user_id, created_at desc);

-- ── trade_setups (engine setups shown on prediction pages) ──────────────────
create table if not exists public.trade_setups (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'global' check (scope in ('global', 'user')),
  user_id uuid references auth.users(id) on delete cascade,
  coin_id text not null,
  symbol text not null,
  name text not null,
  contract_address text,
  chain text,
  image text,
  timeframe text not null default 'daily',
  bias text not null check (bias in ('bullish', 'bearish', 'neutral')),
  confidence int not null default 50,
  entry_price numeric not null,
  entry_low numeric not null,
  entry_high numeric not null,
  stop_loss numeric not null,
  take_profit_1 numeric not null,
  take_profit_2 numeric not null,
  take_profit_3 numeric not null,
  status text not null default 'active'
    check (status in ('active', 'hit_tp1', 'hit_tp2', 'hit_tp3', 'stopped', 'invalidated', 'expired')),
  last_price numeric not null,
  peak_price numeric not null default 0,
  pnl_percent numeric not null default 0,
  hit_targets int not null default 0,
  resolved_at timestamptz,
  expires_at timestamptz,
  write_up text,
  seo_slug text,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists trade_setups_lookup_idx
  on public.trade_setups (coin_id, timeframe, scope, status, generated_at desc);
create index if not exists trade_setups_user_idx on public.trade_setups (user_id, generated_at desc);

-- ── user_roles (admin gate for /admin) ──────────────────────────────────────
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- ── prediction_outcomes (admin grading) ─────────────────────────────────────
create table if not exists public.prediction_outcomes (
  id uuid primary key default gen_random_uuid(),
  coin_id text not null,
  symbol text,
  timeframe text not null default 'daily',
  generated_at timestamptz not null,
  resolved_at timestamptz not null default now(),
  predicted_bias text not null,
  confidence int,
  price_at_prediction numeric,
  price_at_resolution numeric,
  was_correct boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists prediction_outcomes_coin_idx on public.prediction_outcomes (coin_id, resolved_at desc);

-- ── updated_at touch trigger ────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trade_setups_touch on public.trade_setups;
create trigger trade_setups_touch before update on public.trade_setups
  for each row execute function public.touch_updated_at();

drop trigger if exists portfolio_holdings_touch on public.portfolio_holdings;
create trigger portfolio_holdings_touch before update on public.portfolio_holdings
  for each row execute function public.touch_updated_at();

-- ═════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — users own their rows; the social feed is public-read.
-- ═════════════════════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.user_alerts enable row level security;
alter table public.portfolio_holdings enable row level security;
alter table public.trade_journal enable row level security;
alter table public.dca_plans enable row level security;
alter table public.dca_entries enable row level security;
alter table public.user_predictions enable row level security;
alter table public.trade_setups enable row level security;
alter table public.user_roles enable row level security;
alter table public.prediction_outcomes enable row level security;

-- profiles: everyone can read (social feed needs display names); owner writes.
drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
  on public.profiles for select using (true);
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Owner-only tables: alert / holdings / journal / dca / own setups.
drop policy if exists "alerts owner full access" on public.user_alerts;
create policy "alerts owner full access"
  on public.user_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "holdings owner full access" on public.portfolio_holdings;
create policy "holdings owner full access"
  on public.portfolio_holdings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "journal owner full access" on public.trade_journal;
create policy "journal owner full access"
  on public.trade_journal for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "dca plans owner full access" on public.dca_plans;
create policy "dca plans owner full access"
  on public.dca_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "dca entries owner full access" on public.dca_entries;
create policy "dca entries owner full access"
  on public.dca_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_predictions: public read (feed), owner write.
drop policy if exists "predictions readable by everyone" on public.user_predictions;
create policy "predictions readable by everyone"
  on public.user_predictions for select using (true);
drop policy if exists "users create own predictions" on public.user_predictions;
create policy "users create own predictions"
  on public.user_predictions for insert with check (auth.uid() = user_id);
drop policy if exists "users update own predictions" on public.user_predictions;
create policy "users update own predictions"
  on public.user_predictions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trade_setups: everyone reads (global setups on prediction pages);
-- signed-in users may save their own copies; admins manage global ones.
drop policy if exists "trade setups readable by everyone" on public.trade_setups;
create policy "trade setups readable by everyone"
  on public.trade_setups for select using (true);
drop policy if exists "users create own trade setups" on public.trade_setups;
create policy "users create own trade setups"
  on public.trade_setups for insert with check (auth.uid() = user_id and scope = 'user');
drop policy if exists "users manage own trade setups" on public.trade_setups;
create policy "users manage own trade setups"
  on public.trade_setups for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own trade setups" on public.trade_setups;
create policy "users delete own trade setups"
  on public.trade_setups for delete using (auth.uid() = user_id);

-- user_roles: readable by owner (AdminRoute checks own role); admin writes via dashboard/service key.
drop policy if exists "roles readable by owner" on public.user_roles;
create policy "roles readable by owner"
  on public.user_roles for select using (auth.uid() = user_id);

-- prediction_outcomes: public read (accuracy page), service-role writes only.
drop policy if exists "outcomes readable by everyone" on public.prediction_outcomes;
create policy "outcomes readable by everyone"
  on public.prediction_outcomes for select using (true);

-- ── Grant yourself admin (replace with your email AFTER first signup) ───────
-- Run this once you've created your account on the site:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from public.profiles where email = 'you@example.com'
--   on conflict (user_id, role) do nothing;
