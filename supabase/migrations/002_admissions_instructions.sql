-- ============================================================
-- Admissions table
-- ============================================================
create table public.admissions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  admission_date timestamptz not null,
  discharge_date timestamptz,
  ward text not null,
  room text not null,
  bed_number text not null,
  status text not null default 'admitted' check (status in ('admitted', 'discharged', 'transferred')),
  admitted_by uuid not null references public.profiles on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_admissions_patient_id on public.admissions (patient_id);
create index idx_admissions_status on public.admissions (status);
create index idx_admissions_ward_room_bed on public.admissions (ward, room, bed_number);
create unique index idx_admissions_active_bed on public.admissions (ward, room, bed_number) where status = 'admitted';

-- RLS
alter table public.admissions enable row level security;

create policy "Authenticated users can view admissions"
  on public.admissions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert admissions"
  on public.admissions for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update admissions"
  on public.admissions for update
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- Instructions table
-- ============================================================
create table public.instructions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  instruction_type text not null check (instruction_type in ('activity', 'diet', 'iv', 'oxygen', 'monitoring', 'other')),
  content text not null,
  is_active boolean not null default true,
  start_date date not null,
  end_date date,
  created_by uuid not null references public.profiles on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_instructions_patient_active on public.instructions (patient_id, is_active);
create index idx_instructions_patient_created on public.instructions (patient_id, created_at desc);

-- RLS
alter table public.instructions enable row level security;

create policy "Authenticated users can view instructions"
  on public.instructions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert instructions"
  on public.instructions for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update instructions"
  on public.instructions for update
  to authenticated
  using (true)
  with check (true);
