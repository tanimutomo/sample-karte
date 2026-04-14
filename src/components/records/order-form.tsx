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
import { ClipboardList } from "lucide-react";

interface OrderFormProps {
  patientId: string;
  onCreated: () => void;
}

export function OrderForm({ patientId, onCreated }: OrderFormProps) {
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

    const { error } = await supabase.from("orders").insert({
      patient_id: patientId,
      order_type: form.get("orderType") as string,
      title: form.get("title") as string,
      details: (form.get("details") as string) || null,
      status: "pending",
      ordered_by: user.id,
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
            <ClipboardList className="h-4 w-4 mr-1" />
            オーダー
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>オーダー入力</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>オーダー種別 *</Label>
            <Select name="orderType" defaultValue="lab">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lab">検査</SelectItem>
                <SelectItem value="imaging">画像</SelectItem>
                <SelectItem value="procedure">処置</SelectItem>
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="血液検査 (CBC, 生化学)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">詳細</Label>
            <Textarea
              id="details"
              name="details"
              rows={4}
              placeholder="検査項目、注意事項など..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "オーダー発行"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
