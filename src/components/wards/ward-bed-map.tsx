"use client";

import { useRouter } from "next/navigation";
import type { Admission } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble } from "lucide-react";

const WARDS = [
  { id: "3A", name: "3A病棟", rooms: ["301", "302", "303"], beds: ["A", "B"] },
  { id: "3B", name: "3B病棟", rooms: ["304", "305", "306"], beds: ["A", "B"] },
  { id: "4A", name: "4A病棟", rooms: ["401", "402", "403"], beds: ["A", "B"] },
  { id: "4B", name: "4B病棟", rooms: ["404", "405", "406"], beds: ["A", "B"] },
];

interface WardBedMapProps {
  admissions: Admission[];
}

export function WardBedMap({ admissions }: WardBedMapProps) {
  const router = useRouter();

  function findAdmission(ward: string, room: string, bed: string) {
    return admissions.find(
      (a) => a.ward === ward && a.room === room && a.bed_number === bed
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {WARDS.map((ward) => (
        <Card key={ward.id}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BedDouble className="h-5 w-5" />
              {ward.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ward.rooms.map((room) => (
                <div key={room} className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {room}号室
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ward.beds.map((bed) => {
                      const admission = findAdmission(ward.id, room, bed);
                      const patient = admission?.patients;
                      if (admission && patient) {
                        return (
                          <button
                            key={bed}
                            type="button"
                            onClick={() =>
                              router.push(`/patients/${admission.patient_id}`)
                            }
                            className="flex flex-col items-start rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-2 text-left transition-colors hover:bg-blue-100 dark:hover:bg-blue-950/50"
                          >
                            <span className="text-xs text-muted-foreground">
                              {bed}ベッド
                            </span>
                            <span className="text-sm font-medium truncate w-full">
                              {patient.last_name} {patient.first_name}
                            </span>
                          </button>
                        );
                      }
                      return (
                        <div
                          key={bed}
                          className="flex flex-col items-start rounded-md border border-dashed border-muted-foreground/30 p-2"
                        >
                          <span className="text-xs text-muted-foreground">
                            {bed}ベッド
                          </span>
                          <span className="text-sm text-muted-foreground/50">
                            空床
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
