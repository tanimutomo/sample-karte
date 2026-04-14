export type Gender = "male" | "female" | "other";
export type BloodType = "A" | "B" | "O" | "AB" | "unknown";
export type AllergySeverity = "mild" | "moderate" | "severe";
export type NoteType = "doctor" | "nursing" | "rehab" | "msw";
export type MedicationRoute =
  | "oral"
  | "iv"
  | "im"
  | "sc"
  | "topical"
  | "inhalation"
  | "other";
export type OrderType = "lab" | "imaging" | "procedure" | "other";
export type OrderStatus = "pending" | "completed" | "cancelled";
export type AdmissionStatus = "admitted" | "discharged" | "transferred";
export type InstructionType =
  | "activity"
  | "diet"
  | "iv"
  | "oxygen"
  | "monitoring"
  | "other";
export type DocumentType =
  | "discharge_summary"
  | "referral_letter"
  | "other";
export type UserRole = "doctor" | "nurse" | "rehab" | "msw" | "clerk";

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  department: string | null;
  created_at: string;
}

export interface Patient {
  id: string;
  medical_record_number: string;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  date_of_birth: string;
  gender: Gender;
  blood_type: BloodType;
  address: string | null;
  phone: string | null;
  emergency_contact: string | null;
  insurance_number: string | null;
  created_at: string;
}

export interface Allergy {
  id: string;
  patient_id: string;
  allergen: string;
  severity: AllergySeverity;
  reaction: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProgressNote {
  id: string;
  patient_id: string;
  note_type: NoteType;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  created_by: string;
  created_at: string;
  profiles?: Profile;
}

export interface Vital {
  id: string;
  patient_id: string;
  body_temperature: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse: number | null;
  spo2: number | null;
  respiration_rate: number | null;
  consciousness_level: string | null;
  notes: string | null;
  recorded_by: string;
  recorded_at: string;
  profiles?: Profile;
}

export interface Prescription {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  unit: string;
  frequency: string;
  route: MedicationRoute;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  prescribed_by: string;
  created_at: string;
  profiles?: Profile;
}

export interface Order {
  id: string;
  patient_id: string;
  order_type: OrderType;
  title: string;
  details: string | null;
  status: OrderStatus;
  ordered_by: string;
  created_at: string;
  completed_at: string | null;
  profiles?: Profile;
}

export interface Document {
  id: string;
  patient_id: string;
  document_type: DocumentType;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  profiles?: Profile;
}

export interface Admission {
  id: string;
  patient_id: string;
  admission_date: string;
  discharge_date: string | null;
  ward: string;
  room: string;
  bed_number: string;
  status: AdmissionStatus;
  admitted_by: string;
  notes: string | null;
  created_at: string;
  profiles?: Profile;
  patients?: Patient;
}

export interface Instruction {
  id: string;
  patient_id: string;
  instruction_type: InstructionType;
  content: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_by: string;
  created_at: string;
  profiles?: Profile;
}

// Timeline item is a union of all record types
export type TimelineItemType =
  | "progress_note"
  | "vital"
  | "prescription"
  | "order"
  | "document"
  | "admission"
  | "instruction";

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  created_at: string;
  data: ProgressNote | Vital | Prescription | Order | Document | Admission | Instruction;
}

// Supabase Database type for type-safe queries
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, "id" | "created_at">;
        Update: Partial<Omit<Patient, "id" | "created_at">>;
      };
      allergies: {
        Row: Allergy;
        Insert: Omit<Allergy, "id" | "created_at">;
        Update: Partial<Omit<Allergy, "id" | "created_at">>;
      };
      progress_notes: {
        Row: ProgressNote;
        Insert: Omit<ProgressNote, "id" | "created_at" | "profiles">;
        Update: Partial<Omit<ProgressNote, "id" | "created_at" | "profiles">>;
      };
      vitals: {
        Row: Vital;
        Insert: Omit<Vital, "id" | "profiles">;
        Update: Partial<Omit<Vital, "id" | "profiles">>;
      };
      prescriptions: {
        Row: Prescription;
        Insert: Omit<Prescription, "id" | "created_at" | "profiles">;
        Update: Partial<Omit<Prescription, "id" | "created_at" | "profiles">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "profiles">;
        Update: Partial<Omit<Order, "id" | "created_at" | "profiles">>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, "id" | "created_at" | "profiles">;
        Update: Partial<Omit<Document, "id" | "created_at" | "profiles">>;
      };
      admissions: {
        Row: Admission;
        Insert: Omit<Admission, "id" | "created_at" | "profiles" | "patients">;
        Update: Partial<Omit<Admission, "id" | "created_at" | "profiles" | "patients">>;
      };
      instructions: {
        Row: Instruction;
        Insert: Omit<Instruction, "id" | "created_at" | "profiles">;
        Update: Partial<Omit<Instruction, "id" | "created_at" | "profiles">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
