"use client";

import { useRouter } from "next/navigation";
import type { Patient } from "@/lib/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, differenceInYears } from "date-fns";

const genderLabel: Record<string, string> = {
  male: "男",
  female: "女",
  other: "他",
};

interface PatientTableProps {
  patients: Patient[];
}

export function PatientTable({ patients }: PatientTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">診察券番号</TableHead>
            <TableHead>氏名</TableHead>
            <TableHead>カナ</TableHead>
            <TableHead className="w-[60px]">性別</TableHead>
            <TableHead className="w-[120px]">生年月日</TableHead>
            <TableHead className="w-[60px]">年齢</TableHead>
            <TableHead className="w-[60px]">血液型</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                患者が見つかりません
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow
                key={patient.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/patients/${patient.id}`)}
              >
                <TableCell className="font-mono text-sm">
                  {patient.medical_record_number}
                </TableCell>
                <TableCell className="font-medium">
                  {patient.last_name} {patient.first_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.last_name_kana} {patient.first_name_kana}
                </TableCell>
                <TableCell>{genderLabel[patient.gender] ?? patient.gender}</TableCell>
                <TableCell>{format(new Date(patient.date_of_birth), "yyyy/MM/dd")}</TableCell>
                <TableCell>
                  {differenceInYears(new Date(), new Date(patient.date_of_birth))}歳
                </TableCell>
                <TableCell>{patient.blood_type === "unknown" ? "-" : patient.blood_type}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
