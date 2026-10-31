-- HealthMantra Supabase schema.
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query) once
-- you've created a project. Also disable "Confirm email" under
-- Authentication > Providers > Email for this demo, so sign-up logs the user
-- in immediately (no inbox to click through).
--
-- This schema does NOT seed `conditions` / `question_steps` (that content is
-- sizeable and generated, not literal SQL). After running this file, also
-- run:
--   node supabase/generate-seed-content.mjs > /tmp/seed-content.sql
-- and run the output in the SQL editor too, or the patient Home screen will
-- have no conditions to show.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  gender text,
  birthdate date,
  avatar_emoji text,
  specialty text,
  price numeric -- doctors only: consult fee shown to patients in "Find a Doctor"
);

create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  patient_name text not null,
  condition_id text not null,
  condition_name text not null,
  answers jsonb not null default '{}',
  findings jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  doctor_note jsonb,
  doctor_id uuid references profiles(id) on delete set null, -- set once the patient picks a doctor
  doctor_name text,
  created_at timestamptz not null default now()
);

-- Patient-facing content, owned by Admin. Patients and doctors only ever
-- read these.
create table if not exists conditions (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  icon text not null,
  color text not null,
  tagline text not null,
  description text not null,
  sort_order int not null default 0
);

create table if not exists question_steps (
  id text primary key default gen_random_uuid()::text,
  condition_id text not null references conditions(id) on delete cascade,
  sort_order int not null default 0,
  question text not null,
  helper_text text,
  type text not null check (type in ('text', 'textarea', 'number', 'select', 'yesno', 'date', 'photo', 'repeatable')),
  options jsonb,
  max_length int,
  placeholder text,
  repeatable_fields jsonb,
  repeatable_item_label text
);

alter table profiles enable row level security;
alter table diary_entries enable row level security;
alter table conditions enable row level security;
alter table question_steps enable row level security;

create or replace function current_role_is(target_role text) returns boolean as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = target_role);
$$ language sql security definer stable;

-- profiles: a user can read/update only their own row; doctors and admins
-- can read every profile (review queues + account management); any signed-in
-- user can read doctor-role profiles (patients browsing "Find a Doctor" —
-- these accounts are the public-facing doctor directory).
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_select_staff" on profiles for select using (
  current_role_is('doctor') or current_role_is('admin')
);
create policy "profiles_select_doctors_public" on profiles for select using (
  role = 'doctor' and auth.uid() is not null
);
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- diary_entries: patients manage their own; a doctor can only see/update
-- entries the patient has assigned to them (doctor_id = auth.uid()); admins
-- see everything (admin data view).
create policy "diary_select_own" on diary_entries for select using (auth.uid() = patient_id);
create policy "diary_select_assigned_doctor" on diary_entries for select using (
  current_role_is('doctor') and doctor_id = auth.uid()
);
create policy "diary_select_admin" on diary_entries for select using (current_role_is('admin'));
create policy "diary_insert_own" on diary_entries for insert with check (auth.uid() = patient_id);
-- Patients update their own row to assign/reassign a doctor.
create policy "diary_update_own" on diary_entries for update using (auth.uid() = patient_id) with check (auth.uid() = patient_id);
create policy "diary_update_doctor" on diary_entries for update using (
  current_role_is('doctor') and doctor_id = auth.uid()
);

-- conditions / question_steps: readable by any signed-in user; writable
-- only by Admin.
create policy "conditions_select_all" on conditions for select using (auth.uid() is not null);
create policy "conditions_write_admin" on conditions for all using (current_role_is('admin')) with check (current_role_is('admin'));
create policy "question_steps_select_all" on question_steps for select using (auth.uid() is not null);
create policy "question_steps_write_admin" on question_steps for all using (current_role_is('admin')) with check (current_role_is('admin'));

-- Storage: create two public buckets from the dashboard (Storage > New bucket):
--   photos      (public)  -- condition photos attached during intake
--   signatures  (public)  -- doctor signature images
-- Public buckets are simplest for this demo; tighten with signed URLs + RLS
-- storage policies before shipping to real patients.
