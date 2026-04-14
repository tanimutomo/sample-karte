"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { FileText } from "lucide-react";

interface ProgressNoteFormProps {
  patientId: string;
  onCreated: () => void;
}

export function ProgressNoteForm({ patientId, onCreated }: ProgressNoteFormProps) {
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

    const { error } = await supabase.from("progress_notes").insert({
      patient_id: patientId,
      note_type: form.get("noteType") as string,
      subjective: (form.get("subjective") as string) || null,
      objective: (form.get("objective") as string) || null,
      assessment: (form.get("assessment") as string) || null,
      plan: (form.get("plan") as string) || null,
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
            <FileText className="h-4 w-4 mr-1" />
            経過記録
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>経過記録 (SOAP)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>記録タイプ</Label>
            <Select name="noteType" defaultValue="doctor">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">医師記録</SelectItem>
                <SelectItem value="nursing">看護記録</SelectItem>
                <SelectItem value="rehab">リハビリ記録</SelectItem>
                <SelectItem value="msw">MSW記録</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjective">S (主観的情報)</Label>
            <Textarea
              id="subjective"
              name="subjective"
              placeholder="患者の訴え、自覚症状..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">O (客観的情報)</Label>
            <Textarea
              id="objective"
              name="objective"
              placeholder="検査結果、バイタルサイン、診察所見..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assessment">A (評価)</Label>
            <Textarea
              id="assessment"
              name="assessment"
              placeholder="診断、問題点の評価..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">P (計画)</Label>
            <Textarea
              id="plan"
              name="plan"
              placeholder="治療方針、検査予定、指導内容..."
              rows={3}
            />
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
