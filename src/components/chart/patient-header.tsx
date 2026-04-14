"use client";

import type { Patient, Allergy } from "@/lib/types/database";
import { AllergyBadges } from "./allergy-badges";
import { Badge } from "@/components/ui/badge";
import { differenceInYears, format } from "date-fns";
import { User, Phone, MapPin, ShieldAlert, BedDouble } from "lucide-react";

const genderLabel: Record<string, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

interface PatientHeaderProps {
  patient: Patient;
  allergies: Allergy[];
  admission?: {
    ward: string;
    room: string;
    bed_number: string;
    admission_date: string;
    status: string;
  } | null;
}

export function PatientHeader({ patient, allergies, admission }: PatientHeaderProps) {
  const age = differenceInYears(new Date(), new Date(patient.date_of_birth));

  return (
    <div className="border-b bg-card p-4 space-y-3">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {patient.last_name} {patient.first_name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({patient.last_name_kana} {patient.first_name_kana})
              </span>
            </h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{genderLabel[patient.gender]}</span>
              <span>{age}歳</span>
              <span>{format(new Date(patient.date_of_birth), "yyyy/MM/dd")}生</span>
              <span>
                血液型: {patient.blood_type === "unknown" ? "不明" : `${patient.blood_type}型`}
              </span>
            </div>
          </div>
        </div>
        <div className="ml-auto text-sm text-muted-foreground space-y-1">
          <div className="font-mono">診察券: {patient.medical_record_number}</div>
          {patient.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {patient.phone}
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {patient.address}
            </div>
          )}
        </div>
      </div>
      {admission && admission.status === "admitted" && (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-blue-600">
            <BedDouble className="h-3 w-3 mr-1" />
            入院中: {admission.ward}病棟 {admission.room}号室 {admission.bed_number}ベッド
          </Badge>
          <span className="text-xs text-muted-foreground">
            入院日: {format(new Date(admission.admission_date), "yyyy/MM/dd HH:mm")}
          </span>
        </div>
      )}
      {allergies.length > 0 && (
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">アレルギー:</span>
          <AllergyBadges allergies={allergies} />
        </div>
      )}
    </div>
  );
}
