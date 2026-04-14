"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart } from "lucide-react";

interface VitalsFormProps {
  patientId: string;
  onCreated: () => void;
}

export function VitalsForm({ patientId, onCreated }: VitalsFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const toNum = (key: string) => {
      const v = form.get(key) as string;
      return v ? Number(v) : null;
    };

    const { error } = await supabase.from("vitals").insert({
      patient_id: patientId,
      body_temperature: toNum("bodyTemperature"),
      blood_pressure_systolic: toNum("bpSystolic"),
      blood_pressure_diastolic: toNum("bpDiastolic"),
      pulse: toNum("pulse"),
      spo2: toNum("spo2"),
      respiration_rate: toNum("respirationRate"),
      consciousness_level: (form.get("consciousness") as string) || null,
      notes: (form.get("notes") as string) || null,
      recorded_by: user.id,
      recorded_at: new Date().toISOString(),
    });

    setLoading(false);
    if (!error) {
      setOpen(false);
      onCreated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-1" />
            バイタル
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>バイタルサイン入力</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodyTemperature">体温 (°C)</Label>
              <Input
                id="bodyTemperature"
                name="bodyTemperature"
                type="number"
                step="0.1"
                placeholder="36.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pulse">脈拍 (bpm)</Label>
              <Input
                id="pulse"
                name="pulse"
                type="number"
                placeholder="72"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpSystolic">収縮期血圧 (mmHg)</Label>
              <Input
                id="bpSystolic"
                name="bpSystolic"
                type="number"
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpDiastolic">拡張期血圧 (mmHg)</Label>
              <Input
                id="bpDiastolic"
                name="bpDiastolic"
                type="number"
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spo2">SpO2 (%)</Label>
              <Input
                id="spo2"
                name="spo2"
                type="number"
                placeholder="98"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="respirationRate">呼吸数 (/min)</Label>
              <Input
                id="respirationRate"
                name="respirationRate"
                type="number"
                placeholder="16"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="consciousness">意識レベル</Label>
            <Input
              id="consciousness"
              name="consciousness"
              placeholder="清明 / JCS 0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
