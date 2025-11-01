-- Optional: only needed once per project if pgcrypto/gen_random_uuid isn’t available.
create extension if not exists "pgcrypto";

-- 1. Enumerations describing the kinds of jobs and published states.
create type job_type as enum ('Full-Time', 'Part-Time', 'Contract');
create type job_status as enum ('draft', 'published', 'archived');

-- 2. Main jobs table.
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  poster_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  slug text generated always as (regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) stored,
  company_name text not null,
  location text not null,
  job_type job_type not null default 'Full-Time',
  job_status job_status not null default 'draft',
  overview text,
  description text,
  responsibilities text[] default '{}',
  requirements text[] default '{}',
  benefits text[] default '{}',
  about_company text,
  application_url text,
  application_email text,
  published_at timestamptz,
  salary_min integer,
  salary_max integer,
  salary_currency char(3) default 'USD',
  tags text[] default '{}',
  metadata jsonb default '{}'::jsonb,
  constraint jobs_slug_unique unique (slug),
  constraint salary_range_check check (
    salary_min is null or salary_max is null or salary_min <= salary_max
  )
);

-- 3. Keep updated_at fresh on data changes.
create trigger jobs_set_updated_at
before update on public.jobs
for each row execute procedure public.set_updated_at();

-- If you don’t already have a helper function for updated_at:
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- 4. Indexes to speed up lookups.
create index jobs_poster_id_idx on public.jobs (poster_id);
create index jobs_status_idx on public.jobs (job_status);
create index jobs_created_at_idx on public.jobs (created_at desc);

-- 5. Enable Row Level Security.
alter table public.jobs enable row level security;

-- Policy: posters can manage their own jobs.
create policy "Job posters can CRUD own listings"
  on public.jobs
  for all
  using (auth.uid() = poster_id)
  with check (auth.uid() = poster_id);

-- Policy: published jobs are publicly readable (applicants).
create policy "Published jobs are readable by anyone"
  on public.jobs
  for select
  using (job_status = 'published');
