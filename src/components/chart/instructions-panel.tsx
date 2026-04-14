"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Instruction, InstructionType } from "@/lib/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ScrollText } from "lucide-react";

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

interface InstructionsPanelProps {
  patientId: string;
  refreshKey: number;
}

export function InstructionsPanel({ patientId, refreshKey }: InstructionsPanelProps) {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchInstructions = useCallback(async () => {
    const { data } = await supabase
      .from("instructions")
      .select("*, profiles(*)")
      .eq("patient_id", patientId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (data) {
      setInstructions(data as Instruction[]);
    }
    setLoading(false);
  }, [patientId, supabase, refreshKey]);

  useEffect(() => {
    fetchInstructions();
  }, [fetchInstructions]);

  async function handleDeactivate(id: string) {
    await supabase
      .from("instructions")
      .update({ is_active: false })
      .eq("id", id);
    fetchInstructions();
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ScrollText className="h-4 w-4" />
          指示簿（アクティブ）
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        {loading ? (
          <div className="text-sm text-muted-foreground">読み込み中...</div>
        ) : instructions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            アクティブな指示はありません
          </div>
        ) : (
          <div className="space-y-2">
            {instructions.map((inst) => (
              <div
                key={inst.id}
                className="flex items-start justify-between gap-2 text-sm border rounded-md p-2"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeColors[inst.instruction_type]}`}
                    >
                      {typeLabels[inst.instruction_type]}
                    </span>
                  </div>
                  <div className="text-sm">{inst.content}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(inst.start_date), "yyyy/MM/dd")} 〜{" "}
                    {inst.end_date
                      ? format(new Date(inst.end_date), "yyyy/MM/dd")
                      : "継続中"}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => handleDeactivate(inst.id)}
                >
                  中止
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
