"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Patient } from "@/lib/types/database";
import { PatientSearch } from "@/components/patients/patient-search";
import { PatientTable } from "@/components/patients/patient-table";
import { PatientForm } from "@/components/patients/patient-form";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (search.trim()) {
      const s = search.trim();
      query = query.or(
        `last_name.ilike.%${s}%,first_name.ilike.%${s}%,last_name_kana.ilike.%${s}%,first_name_kana.ilike.%${s}%,medical_record_number.ilike.%${s}%`
      );
    }

    const { data } = await query;
    setPatients((data as Patient[]) || []);
    setLoading(false);
  }, [search, supabase]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <div className="container mx-auto py-6 px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">患者一覧</h1>
        <PatientForm onCreated={fetchPatients} />
      </div>
      <PatientSearch value={search} onChange={setSearch} />
      {loading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          読み込み中...
        </div>
      ) : (
        <PatientTable patients={patients} />
      )}
    </div>
  );
}
