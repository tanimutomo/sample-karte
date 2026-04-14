"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Patient, Allergy, Admission } from "@/lib/types/database";
import { PatientHeader } from "@/components/chart/patient-header";
import { Timeline } from "@/components/chart/timeline";
import { VitalsChart } from "@/components/chart/vitals-chart";
import { InstructionsPanel } from "@/components/chart/instructions-panel";
import { DateRangePicker } from "@/components/chart/date-range-picker";
import { ProgressNoteForm } from "@/components/records/progress-note-form";
import { VitalsForm } from "@/components/records/vitals-form";
import { PrescriptionForm } from "@/components/records/prescription-form";
import { OrderForm } from "@/components/records/order-form";
import { DocumentForm } from "@/components/records/document-form";
import { AdmissionForm } from "@/components/records/admission-form";
import { InstructionForm } from "@/components/records/instruction-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { format, subMonths } from "date-fns";

export default function PatientChartPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [startDate, setStartDate] = useState(
    format(subMonths(new Date(), 3), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const supabase = createClient();

  const fetchPatient = useCallback(async () => {
    const patientRes = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single();
    const allergyRes = await supabase
      .from("allergies")
      .select("*")
      .eq("patient_id", patientId)
      .order("severity", { ascending: false });
    const admissionRes = await supabase
      .from("admissions")
      .select("*")
      .eq("patient_id", patientId)
      .eq("status", "admitted")
      .limit(1)
      .maybeSingle();

    if (patientRes.data) setPatient(patientRes.data as Patient);
    if (allergyRes.data) setAllergies(allergyRes.data as Allergy[]);
    setAdmission((admissionRes.data as Admission) ?? null);
    setLoading(false);
  }, [patientId, supabase]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  function handleRecordCreated() {
    setRefreshKey((k) => k + 1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        患者が見つかりません
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/patients")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          患者一覧に戻る
        </Button>
      </div>

      <PatientHeader patient={patient} allergies={allergies} admission={admission} />

      <div className="container mx-auto px-4 py-3">
        <InstructionsPanel patientId={patientId} refreshKey={refreshKey} />
      </div>

      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            新規作成:
          </span>
          <ProgressNoteForm
            patientId={patientId}
            onCreated={handleRecordCreated}
          />
          <VitalsForm
            patientId={patientId}
            onCreated={handleRecordCreated}
          />
          <PrescriptionForm
            patientId={patientId}
            onCreated={handleRecordCreated}
          />
          <OrderForm
            patientId={patientId}
            onCreated={handleRecordCreated}
          />
          <DocumentForm
            patientId={patientId}
            onCreated={handleRecordCreated}
          />
          <AdmissionForm
            patientId={patientId}
            onCreated={handleRecordCreated}
          />
          <InstructionForm
            patientId={patientId}
            onCreated={handleRecordCreated}
          />
        </div>
      </div>

      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-end mb-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">タイムライン</TabsTrigger>
            <TabsTrigger value="vitals-chart">バイタルグラフ</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline">
            <Timeline
              patientId={patientId}
              refreshKey={refreshKey}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>
          <TabsContent value="vitals-chart">
            <VitalsChart
              patientId={patientId}
              startDate={startDate}
              endDate={endDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
