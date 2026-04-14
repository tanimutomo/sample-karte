"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Instruction, InstructionType } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const typeLabels: Record<InstructionType, string> = {
  activity: "安静度",
  diet: "食事",
  iv: "輸液",
  oxygen: "酸素",
  monitoring: "観察",
  other: "その他",
};

const typeColors: Record<InstructionType, string> = {
  activity: "bg-blue-100 text-blue-800",
  diet: "bg-green-100 text-green-800",
  iv: "bg-purple-100 text-purple-800",
  oxygen: "bg-red-100 text-red-800",
  monitoring: "bg-amber-100 text-amber-800",
  other: "bg-gray-100 text-gray-800",
};

type Filter = "active" | "inactive" | "all";
type TypeFilter = InstructionType | "all";

interface InstructionWithPatient extends Instruction {
  patients?: { id: string; last_name: string; first_name: string; medical_record_number: string };
}

export default function InstructionsPage() {
  const [instructions, setInstructions] = useState<InstructionWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Filter>("active");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const router = useRouter();
  const supabase = createClient();

  const fetchInstructions = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("instructions")
      .select("*, profiles(*), patients(id, last_name, first_name, medical_record_number)")
      .order("created_at", { ascending: false });

    if (statusFilter === "active") {
      query = query.eq("is_active", true);
    } else if (statusFilter === "inactive") {
      query = query.eq("is_active", false);
    }

    if (typeFilter !== "all") {
      query = query.eq("instruction_type", typeFilter);
    }

    const { data } = await query;
    setInstructions((data as InstructionWithPatient[]) || []);
    setLoading(false);
  }, [supabase, statusFilter, typeFilter]);

  useEffect(() => {
    fetchInstructions();
  }, [fetchInstructions]);

  async function handleDeactivate(id: string) {
    await supabase.from("instructions").update({ is_active: false }).eq("id", id);
    fetchInstructions();
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-4">
      <h1 className="text-2xl font-bold">指示簿管理</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1">
          {(["active", "inactive", "all"] as Filter[]).map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(f)}
            >
              {f === "active" ? "アクティブ" : f === "inactive" ? "中止済" : "すべて"}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("all")}
          >
            全種別
          </Button>
          {(Object.keys(typeLabels) as InstructionType[]).map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(t)}
            >
              {typeLabels[t]}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              読み込み中...
            </div>
          ) : instructions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              該当する指示はありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">状態</TableHead>
                  <TableHead className="w-[80px]">種別</TableHead>
                  <TableHead className="w-[140px]">患者</TableHead>
                  <TableHead>指示内容</TableHead>
                  <TableHead className="w-[200px]">期間</TableHead>
                  <TableHead className="w-[120px]">指示者</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructions.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <Badge variant={inst.is_active ? "default" : "secondary"}>
                        {inst.is_active ? "アクティブ" : "中止"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeColors[inst.instruction_type]}`}
                      >
                        {typeLabels[inst.instruction_type]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {inst.patients ? (
                        <button
                          className="text-left hover:underline text-sm"
                          onClick={() => router.push(`/patients/${inst.patients!.id}`)}
                        >
                          <div className="font-medium">
                            {inst.patients.last_name} {inst.patients.first_name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {inst.patients.medical_record_number}
                          </div>
                        </button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{inst.content}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(inst.start_date), "yyyy/MM/dd")} 〜{" "}
                      {inst.end_date
                        ? format(new Date(inst.end_date), "yyyy/MM/dd")
                        : "継続中"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inst.profiles?.display_name ?? "-"}
                    </TableCell>
                    <TableCell>
                      {inst.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDeactivate(inst.id)}
                        >
                          中止
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
