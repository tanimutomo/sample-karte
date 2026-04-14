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
import { ScrollText } from "lucide-react";
import { format } from "date-fns";

interface InstructionFormProps {
  patientId: string;
  onCreated: () => void;
}

export function InstructionForm({ patientId, onCreated }: InstructionFormProps) {
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

    const { error } = await supabase.from("instructions").insert({
      patient_id: patientId,
      instruction_type: form.get("instructionType") as string,
      content: form.get("content") as string,
      is_active: true,
      start_date: form.get("startDate") as string,
      end_date: (form.get("endDate") as string) || null,
      created_by: user.id,
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
            <ScrollText className="h-4 w-4 mr-1" />
            指示
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>指示入力</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>指示種別 *</Label>
            <Select name="instructionType" defaultValue="activity">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activity">安静度</SelectItem>
                <SelectItem value="diet">食事</SelectItem>
                <SelectItem value="iv">輸液</SelectItem>
                <SelectItem value="oxygen">酸素</SelectItem>
                <SelectItem value="monitoring">観察</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={3}
              placeholder="指示内容を入力..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日 *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">終了日</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "指示登録"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
