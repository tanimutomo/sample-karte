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
import { BedDouble } from "lucide-react";

interface AdmissionFormProps {
  patientId: string;
  onCreated: () => void;
}

export function AdmissionForm({ patientId, onCreated }: AdmissionFormProps) {
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

    const { error } = await supabase.from("admissions").insert({
      patient_id: patientId,
      ward: form.get("ward") as string,
      room: form.get("room") as string,
      bed_number: form.get("bed_number") as string,
      admission_date: form.get("admission_date") as string,
      status: "admitted",
      admitted_by: user.id,
      notes: (form.get("notes") as string) || null,
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
            <BedDouble className="h-4 w-4 mr-1" />
            入院登録
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>入院登録</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>病棟 *</Label>
            <Select name="ward" defaultValue="3A">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3A">3A</SelectItem>
                <SelectItem value="3B">3B</SelectItem>
                <SelectItem value="4A">4A</SelectItem>
                <SelectItem value="4B">4B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="room">部屋番号 *</Label>
            <Input
              id="room"
              name="room"
              required
              placeholder="301"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bed_number">ベッド *</Label>
            <Input
              id="bed_number"
              name="bed_number"
              required
              placeholder="A or B"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admission_date">入院日時 *</Label>
            <Input
              id="admission_date"
              name="admission_date"
              type="datetime-local"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="入院に関する備考..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "入院登録"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
