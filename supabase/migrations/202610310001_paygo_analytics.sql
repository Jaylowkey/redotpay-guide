-- PAYGO RedotPay acquisition analytics
-- Apply only to the dedicated PAYGO Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.paygo_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null check (event_name in ('page_view','invite_click','promo_copy','whatsapp_click','signup_start','signup_confirmed','kyc_verified','card_requested')),
  page_path text not null default '/',
  source text not null default 'direct',
  medium text not null default '',
  campaign text not null default '',
  content text not null default '',
  term text not null default '',
  referrer_host text not null default '',
  country text,
  device_type text not null default 'desktop' check (device_type in ('mobile','desktop')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists paygo_events_created_at_idx on public.paygo_events(created_at desc);
create index if not exists paygo_events_event_created_idx on public.paygo_events(event_name,created_at desc);
create index if not exists paygo_events_session_idx on public.paygo_events(session_id);
create index if not exists paygo_events_source_idx on public.paygo_events(source,created_at desc);
alter table public.paygo_events enable row level security;
revoke all on public.paygo_events from anon, authenticated;
grant all on public.paygo_events to service_role;

create or replace function public.paygo_admin_metrics(p_days integer default 30)
returns jsonb
language sql
security definer
set search_path = public
as $$
with bounds as (
  select now() - make_interval(days => greatest(1,least(coalesce(p_days,30),90))) as since_at
),
filtered as (
  select e.* from public.paygo_events e,bounds b where e.created_at >= b.since_at
),
totals as (
  select
    count(distinct session_id) filter(where event_name='page_view') as visits,
    count(*) filter(where event_name='invite_click') as invite_clicks,
    count(*) filter(where event_name='signup_confirmed') as signup_confirmed,
    count(*) filter(where event_name='signup_start') as signup_start,
    count(*) filter(where event_name='kyc_verified') as kyc_verified,
    count(*) filter(where event_name='card_requested') as card_requested
  from filtered
),
daily as (
  select d::date as day,
    to_char(d,'DD/MM') as label,
    count(distinct f.session_id) filter(where f.event_name='page_view') as visits
  from bounds b
  cross join lateral generate_series(date_trunc('day',b.since_at),date_trunc('day',now()),interval '1 day') d
  left join filtered f on f.created_at >= d and f.created_at < d + interval '1 day'
  group by d order by d
),
sources as (
  select coalesce(nullif(source,''),'direct') as source,count(distinct session_id) as count
  from filtered where event_name='page_view' group by 1 order by 2 desc limit 10
),
countries as (
  select coalesce(nullif(country,''),'Unknown') as country,count(distinct session_id) as count
  from filtered where event_name='page_view' group by 1 order by 2 desc limit 10
),
funnel as (
  select event_name,count(*) as count from filtered group by event_name order by count desc
),
recent as (
  select created_at,event_name,source,country from filtered order by created_at desc limit 25
)
select jsonb_build_object(
  'totals',jsonb_build_object(
    'visits',coalesce((select visits from totals),0),
    'invite_clicks',coalesce((select invite_clicks from totals),0),
    'signup_confirmed',coalesce((select signup_confirmed from totals),0),
    'signup_start',coalesce((select signup_start from totals),0),
    'kyc_verified',coalesce((select kyc_verified from totals),0),
    'card_requested',coalesce((select card_requested from totals),0),
    'conversion_rate',case when coalesce((select visits from totals),0)=0 then 0 else round(100.0*(select signup_confirmed from totals)/nullif((select visits from totals),0),2) end
  ),
  'daily',coalesce((select jsonb_agg(to_jsonb(daily)) from daily),'[]'::jsonb),
  'sources',coalesce((select jsonb_agg(to_jsonb(sources)) from sources),'[]'::jsonb),
  'countries',coalesce((select jsonb_agg(to_jsonb(countries)) from countries),'[]'::jsonb),
  'funnel',coalesce((select jsonb_agg(to_jsonb(funnel)) from funnel),'[]'::jsonb),
  'recent',coalesce((select jsonb_agg(to_jsonb(recent)) from recent),'[]'::jsonb)
);
$$;
revoke all on function public.paygo_admin_metrics(integer) from public,anon,authenticated;
grant execute on function public.paygo_admin_metrics(integer) to service_role;
