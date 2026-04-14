-- ==========================================
-- 電子カルテ (EHR) データベーススキーマ
-- ==========================================

-- プロフィール（Supabase Auth連携）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  role text not null default 'doctor' check (role in ('doctor', 'nurse', 'rehab', 'msw', 'clerk')),
  department text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 新規ユーザー登録時にプロフィールを自動作成
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email), 'doctor');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 患者
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  medical_record_number text unique not null,
  last_name text not null,
  first_name text not null,
  last_name_kana text not null,
  first_name_kana text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  blood_type text not null default 'unknown' check (blood_type in ('A', 'B', 'O', 'AB', 'unknown')),
  address text,
  phone text,
  emergency_contact text,
  insurance_number text,
  created_at timestamptz not null default now()
);

alter table public.patients enable row level security;
create policy "Patients are viewable by authenticated users" on public.patients
  for select using (auth.role() = 'authenticated');
create policy "Patients are insertable by authenticated users" on public.patients
  for insert with check (auth.role() = 'authenticated');
create policy "Patients are updatable by authenticated users" on public.patients
  for update using (auth.role() = 'authenticated');

-- アレルギー
create table public.allergies (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  allergen text not null,
  severity text not null default 'moderate' check (severity in ('mild', 'moderate', 'severe')),
  reaction text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.allergies enable row level security;
create policy "Allergies are viewable by authenticated users" on public.allergies
  for select using (auth.role() = 'authenticated');
create policy "Allergies are insertable by authenticated users" on public.allergies
  for insert with check (auth.role() = 'authenticated');
create policy "Allergies are updatable by authenticated users" on public.allergies
  for update using (auth.role() = 'authenticated');

-- 経過記録（SOAP形式）
create table public.progress_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  note_type text not null check (note_type in ('doctor', 'nursing', 'rehab', 'msw')),
  subjective text,
  objective text,
  assessment text,
  plan text,
  created_by uuid not null references public.profiles on delete set null,
  created_at timestamptz not null default now()
);

alter table public.progress_notes enable row level security;
create policy "Progress notes are viewable by authenticated users" on public.progress_notes
  for select using (auth.role() = 'authenticated');
create policy "Progress notes are insertable by authenticated users" on public.progress_notes
  for insert with check (auth.role() = 'authenticated');

-- バイタルサイン
create table public.vitals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  body_temperature numeric(4,1),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  pulse integer,
  spo2 integer,
  respiration_rate integer,
  consciousness_level text,
  notes text,
  recorded_by uuid not null references public.profiles on delete set null,
  recorded_at timestamptz not null default now()
);

alter table public.vitals enable row level security;
create policy "Vitals are viewable by authenticated users" on public.vitals
  for select using (auth.role() = 'authenticated');
create policy "Vitals are insertable by authenticated users" on public.vitals
  for insert with check (auth.role() = 'authenticated');

-- 処方
create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  medication_name text not null,
  dosage text not null,
  unit text not null,
  frequency text not null,
  route text not null default 'oral' check (route in ('oral', 'iv', 'im', 'sc', 'topical', 'inhalation', 'other')),
  start_date date not null,
  end_date date,
  notes text,
  prescribed_by uuid not null references public.profiles on delete set null,
  created_at timestamptz not null default now()
);

alter table public.prescriptions enable row level security;
create policy "Prescriptions are viewable by authenticated users" on public.prescriptions
  for select using (auth.role() = 'authenticated');
create policy "Prescriptions are insertable by authenticated users" on public.prescriptions
  for insert with check (auth.role() = 'authenticated');

-- オーダー
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  order_type text not null check (order_type in ('lab', 'imaging', 'procedure', 'other')),
  title text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  ordered_by uuid not null references public.profiles on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.orders enable row level security;
create policy "Orders are viewable by authenticated users" on public.orders
  for select using (auth.role() = 'authenticated');
create policy "Orders are insertable by authenticated users" on public.orders
  for insert with check (auth.role() = 'authenticated');
create policy "Orders are updatable by authenticated users" on public.orders
  for update using (auth.role() = 'authenticated');

-- 文書
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients on delete cascade,
  document_type text not null check (document_type in ('discharge_summary', 'referral_letter', 'other')),
  title text not null,
  content text not null default '',
  created_by uuid not null references public.profiles on delete set null,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
create policy "Documents are viewable by authenticated users" on public.documents
  for select using (auth.role() = 'authenticated');
create policy "Documents are insertable by authenticated users" on public.documents
  for insert with check (auth.role() = 'authenticated');

-- インデックス
create index idx_patients_kana on public.patients (last_name_kana, first_name_kana);
create index idx_patients_mrn on public.patients (medical_record_number);
create index idx_allergies_patient on public.allergies (patient_id);
create index idx_progress_notes_patient_date on public.progress_notes (patient_id, created_at desc);
create index idx_vitals_patient_date on public.vitals (patient_id, recorded_at desc);
create index idx_prescriptions_patient_date on public.prescriptions (patient_id, created_at desc);
create index idx_orders_patient_date on public.orders (patient_id, created_at desc);
create index idx_documents_patient_date on public.documents (patient_id, created_at desc);
