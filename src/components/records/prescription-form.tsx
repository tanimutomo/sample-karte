"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pill } from "lucide-react";

interface PrescriptionFormProps {
  patientId: string;
  onCreated: () => void;
}

export function PrescriptionForm({ patientId, onCreated }: PrescriptionFormProps) {
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

    const { error } = await supabase.from("prescriptions").insert({
      patient_id: patientId,
      medication_name: form.get("medicationName") as string,
      dosage: form.get("dosage") as string,
      unit: form.get("unit") as string,
      frequency: form.get("frequency") as string,
      route: form.get("route") as string,
      start_date: form.get("startDate") as string,
      end_date: (form.get("endDate") as string) || null,
      notes: (form.get("notes") as string) || null,
      prescribed_by: user.id,
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
            <Pill className="h-4 w-4 mr-1" />
            処方
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>処方入力</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicationName">薬剤名 *</Label>
            <Input
              id="medicationName"
              name="medicationName"
              required
              placeholder="アムロジピン錠5mg"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">用量 *</Label>
              <Input
                id="dosage"
                name="dosage"
                required
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">単位 *</Label>
              <Input
                id="unit"
                name="unit"
                required
                placeholder="錠"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">用法 *</Label>
              <Input
                id="frequency"
                name="frequency"
                required
                placeholder="1日1回朝食後"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>投与経路 *</Label>
            <Select name="route" defaultValue="oral">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oral">経口</SelectItem>
                <SelectItem value="iv">静注</SelectItem>
                <SelectItem value="im">筋注</SelectItem>
                <SelectItem value="sc">皮下注</SelectItem>
                <SelectItem value="topical">外用</SelectItem>
                <SelectItem value="inhalation">吸入</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日 *</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">終了日</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
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
              {loading ? "保存中..." : "処方発行"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
