-- TonnageCheck v1 schema.
--
-- Four tables, all with row level security on and NO policies for anon/authenticated, so the public
-- anon key can neither read nor write them directly. The browser only calls SECURITY DEFINER
-- functions, which validate input, rate-limit, and insert. Reading the data needs the service role.
--
--   quote_audits              anonymized quote checks (3-digit ZIP prefix only, no contact details)
--   installer_match_requests  homeowner requests for an independent second quote (write-only from the web)
--   newsletter_subscribers    newsletter sign-ups (write-only; never reveals whether an address exists)
--   partner_applications      independent HVAC contractors applying for leads (write-only)
--
-- Rate limiting keys on a SHA-256 of the caller's IP plus the current UTC date, so the key rotates
-- daily and the raw IP is never stored.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

create table if not exists public.quote_audits (
  id                        bigint generated always as identity primary key,
  zip_prefix                char(3)      not null check (zip_prefix ~ '^[0-9]{3}$'),
  system_type               text         not null check (system_type in ('central-heat-pump', 'mini-split', 'ac-furnace', 'heat-pump-only')),
  tonnage                   numeric(3,1) not null check (tonnage between 1.0 and 5.0),
  brand                     text                  check (char_length(brand) <= 60),
  model_number              text                  check (char_length(model_number) <= 80),
  quoted_total_usd          numeric(10,2) not null check (quoted_total_usd between 500 and 200000),
  equipment_wholesale_usd   numeric(10,2)          check (equipment_wholesale_usd between 0 and 100000),
  implied_labor_markup_usd  numeric(10,2),
  grade                     char(1)      not null check (grade in ('A', 'B', 'C', 'D', 'F')),
  rate_key                  text         not null,
  created_at                timestamptz  not null default now()
);

create index if not exists quote_audits_rate_idx on public.quote_audits (rate_key, created_at desc);
create index if not exists quote_audits_created_idx on public.quote_audits (created_at desc);

create table if not exists public.installer_match_requests (
  id                  bigint generated always as identity primary key,
  name                text         not null check (char_length(name) between 1 and 120),
  email               text         not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  phone               text                  check (char_length(phone) <= 40),
  zip_code            char(5)      not null check (zip_code ~ '^[0-9]{5}$'),
  quoted_amount_usd   numeric(10,2)          check (quoted_amount_usd between 0 and 200000),
  quoted_brand_model  text                  check (char_length(quoted_brand_model) <= 160),
  timeline            text                  check (timeline in ('asap', '2-4-weeks', '1-3-months', 'researching')),
  notes               text                  check (char_length(notes) <= 2000),
  rate_key            text         not null,
  created_at          timestamptz  not null default now()
);

create index if not exists installer_match_rate_idx on public.installer_match_requests (rate_key, created_at desc);

create table if not exists public.newsletter_subscribers (
  id          bigint generated always as identity primary key,
  email       text         not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  source      text                  check (char_length(source) <= 200),
  rate_key    text         not null,
  created_at  timestamptz  not null default now()
);

create unique index if not exists newsletter_subscribers_email_key on public.newsletter_subscribers (lower(email));
create index if not exists newsletter_subscribers_rate_idx on public.newsletter_subscribers (rate_key, created_at desc);

create table if not exists public.partner_applications (
  id                     bigint generated always as identity primary key,
  company                text         not null check (char_length(company) between 1 and 120),
  contact_name           text         not null check (char_length(contact_name) between 1 and 120),
  email                  text         not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  phone                  text                  check (char_length(phone) <= 40),
  license                text         not null check (char_length(license) between 1 and 80),
  trucks                 smallint     not null check (trucks between 1 and 5),
  service_zips           text[]       not null check (cardinality(service_zips) between 1 and 200),
  about                  text                  check (char_length(about) <= 2000),
  independent_confirmed  boolean      not null check (independent_confirmed),
  rate_key               text         not null,
  created_at             timestamptz  not null default now()
);

create index if not exists partner_applications_rate_idx on public.partner_applications (rate_key, created_at desc);

alter table public.quote_audits enable row level security;
alter table public.installer_match_requests enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.partner_applications enable row level security;
-- RLS is deliberately not FORCEd: the SECURITY DEFINER functions below run as the table owner, which is
-- exempt from non-forced RLS, and that is the only write path.
-- No policies are created on purpose: with RLS on, anon and authenticated get zero rows and cannot insert.
revoke all on public.quote_audits from anon, authenticated;
revoke all on public.installer_match_requests from anon, authenticated;
revoke all on public.newsletter_subscribers from anon, authenticated;
revoke all on public.partner_applications from anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------------

-- Daily-rotating, non-reversible key for the caller. PostgREST exposes request headers as a GUC.
create or replace function public.tc_rate_key()
returns text
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  headers json := nullif(current_setting('request.headers', true), '')::json;
  ip text;
begin
  ip := coalesce(
    split_part(headers ->> 'x-forwarded-for', ',', 1),
    headers ->> 'cf-connecting-ip',
    headers ->> 'x-real-ip',
    'unknown'
  );
  return encode(extensions.digest(trim(ip) || '|' || to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'sha256'), 'hex');
end;
$$;

revoke all on function public.tc_rate_key() from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- RPC: submit_quote_audit
-- Limits: 20 per caller per hour, 2,000 per hour across everyone.
-- implied_labor_markup_usd is computed here, not trusted from the client.
-- ---------------------------------------------------------------------------------------------

create or replace function public.submit_quote_audit(
  p_zip_prefix              text,
  p_system_type             text,
  p_tonnage                 numeric,
  p_brand                   text,
  p_model_number            text,
  p_quoted_total_usd        numeric,
  p_equipment_wholesale_usd numeric,
  p_grade                   text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k text := public.tc_rate_key();
  new_id bigint;
begin
  if (select count(*) from public.quote_audits where rate_key = k and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Too many audits from this connection. Try again in an hour.';
  end if;
  if (select count(*) from public.quote_audits where created_at > now() - interval '1 hour') >= 2000 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Audit logging is busy. Your result is still shown on screen.';
  end if;

  insert into public.quote_audits (
    zip_prefix, system_type, tonnage, brand, model_number,
    quoted_total_usd, equipment_wholesale_usd, implied_labor_markup_usd, grade, rate_key
  ) values (
    left(regexp_replace(coalesce(p_zip_prefix, ''), '[^0-9]', '', 'g'), 3),
    p_system_type,
    round(p_tonnage * 2) / 2,
    nullif(left(trim(p_brand), 60), ''),
    nullif(left(trim(p_model_number), 80), ''),
    round(p_quoted_total_usd, 2),
    round(p_equipment_wholesale_usd, 2),
    case when p_equipment_wholesale_usd is null then null else round(p_quoted_total_usd - p_equipment_wholesale_usd, 2) end,
    upper(p_grade),
    k
  )
  returning id into new_id;

  return json_build_object('ok', true, 'id', new_id);
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- RPC: request_independent_quote (write-only; returns no stored data)
-- Limits: 3 per caller per hour, 10 per caller per day, 300 per hour across everyone.
-- ---------------------------------------------------------------------------------------------

create or replace function public.request_independent_quote(
  p_name               text,
  p_email              text,
  p_phone              text,
  p_zip_code           text,
  p_quoted_amount_usd  numeric,
  p_quoted_brand_model text,
  p_timeline           text,
  p_notes              text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k text := public.tc_rate_key();
begin
  if (select count(*) from public.installer_match_requests where rate_key = k and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.installer_match_requests where rate_key = k and created_at > now() - interval '1 day') >= 10 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'We already have your request. We will be in touch.';
  end if;
  if (select count(*) from public.installer_match_requests where created_at > now() - interval '1 hour') >= 300 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Requests are busy right now. Please try again shortly.';
  end if;

  insert into public.installer_match_requests (
    name, email, phone, zip_code, quoted_amount_usd, quoted_brand_model, timeline, notes, rate_key
  ) values (
    left(trim(p_name), 120),
    lower(left(trim(p_email), 254)),
    nullif(left(regexp_replace(coalesce(p_phone, ''), '[^0-9+() .-]', '', 'g'), 40), ''),
    left(regexp_replace(coalesce(p_zip_code, ''), '[^0-9]', '', 'g'), 5),
    case when p_quoted_amount_usd is null then null else round(p_quoted_amount_usd, 2) end,
    nullif(left(trim(p_quoted_brand_model), 160), ''),
    nullif(p_timeline, ''),
    nullif(left(trim(p_notes), 2000), ''),
    k
  );

  return json_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- RPC: subscribe_newsletter (write-only)
-- Limits: 5 new sign-ups per caller per hour, 1,000 per hour across everyone.
-- A repeat address is silently accepted, so the response never reveals who is subscribed.
-- ---------------------------------------------------------------------------------------------

create or replace function public.subscribe_newsletter(
  p_email  text,
  p_source text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k text := public.tc_rate_key();
  e text := lower(left(trim(coalesce(p_email, '')), 254));
begin
  if e !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email' using errcode = 'P0001', hint = 'Please enter a valid email address.';
  end if;
  if (select count(*) from public.newsletter_subscribers where rate_key = k and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Too many sign-ups from this connection. Try again in an hour.';
  end if;
  if (select count(*) from public.newsletter_subscribers where created_at > now() - interval '1 hour') >= 1000 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Sign-ups are busy right now. Please try again shortly.';
  end if;

  insert into public.newsletter_subscribers (email, source, rate_key)
  values (e, nullif(left(trim(p_source), 200), ''), k)
  on conflict (lower(email)) do nothing;

  return json_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- RPC: submit_partner_application (write-only)
-- Limits: 3 per caller per hour, 5 per caller per day, 200 per hour across everyone.
-- p_service_zips is free text; every 5-digit group in it is kept (deduplicated, max 200).
-- ---------------------------------------------------------------------------------------------

create or replace function public.submit_partner_application(
  p_company      text,
  p_name         text,
  p_email        text,
  p_phone        text,
  p_license      text,
  p_trucks       integer,
  p_service_zips text,
  p_about        text,
  p_independent  boolean
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k text := public.tc_rate_key();
  zips text[];
begin
  if coalesce(p_independent, false) is not true then
    raise exception 'not_independent' using errcode = 'P0001', hint = 'This program is only for independently owned companies.';
  end if;
  select array_agg(distinct z) into zips
    from (select (regexp_matches(coalesce(p_service_zips, ''), '(?<![0-9])[0-9]{5}(?![0-9])', 'g'))[1] as z limit 200) s;
  if zips is null then
    raise exception 'no_zips' using errcode = 'P0001', hint = 'List at least one 5-digit ZIP code you serve.';
  end if;
  if (select count(*) from public.partner_applications where rate_key = k and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.partner_applications where rate_key = k and created_at > now() - interval '1 day') >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'We already have your application. We will be in touch.';
  end if;
  if (select count(*) from public.partner_applications where created_at > now() - interval '1 hour') >= 200 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Applications are busy right now. Please try again shortly.';
  end if;

  insert into public.partner_applications (
    company, contact_name, email, phone, license, trucks, service_zips, about, independent_confirmed, rate_key
  ) values (
    left(trim(p_company), 120),
    left(trim(p_name), 120),
    lower(left(trim(p_email), 254)),
    nullif(left(regexp_replace(coalesce(p_phone, ''), '[^0-9+() .-]', '', 'g'), 40), ''),
    left(trim(p_license), 80),
    p_trucks,
    zips,
    nullif(left(trim(p_about), 2000), ''),
    true,
    k
  );

  return json_build_object('ok', true);
end;
$$;

revoke all on function public.submit_quote_audit(text, text, numeric, text, text, numeric, numeric, text) from public;
revoke all on function public.request_independent_quote(text, text, text, text, numeric, text, text, text) from public;
revoke all on function public.subscribe_newsletter(text, text) from public;
revoke all on function public.submit_partner_application(text, text, text, text, text, integer, text, text, boolean) from public;
grant execute on function public.submit_quote_audit(text, text, numeric, text, text, numeric, numeric, text) to anon, authenticated;
grant execute on function public.request_independent_quote(text, text, text, text, numeric, text, text, text) to anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;
grant execute on function public.submit_partner_application(text, text, text, text, text, integer, text, text, boolean) to anon, authenticated;
