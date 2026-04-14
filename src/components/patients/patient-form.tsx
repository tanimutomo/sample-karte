"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { UserPlus } from "lucide-react";

interface PatientFormProps {
  onCreated: () => void;
}

export function PatientForm({ onCreated }: PatientFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const { error } = await supabase.from("patients").insert({
      medical_record_number: form.get("mrn") as string,
      last_name: form.get("lastName") as string,
      first_name: form.get("firstName") as string,
      last_name_kana: form.get("lastNameKana") as string,
      first_name_kana: form.get("firstNameKana") as string,
      date_of_birth: form.get("dob") as string,
      gender: form.get("gender") as string,
      blood_type: form.get("bloodType") as string,
      address: (form.get("address") as string) || null,
      phone: (form.get("phone") as string) || null,
      emergency_contact: (form.get("emergencyContact") as string) || null,
      insurance_number: (form.get("insuranceNumber") as string) || null,
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
          <Button>
            <UserPlus className="h-4 w-4 mr-1" />
            新規患者登録
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規患者登録</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mrn">診察券番号 *</Label>
              <Input id="mrn" name="mrn" required placeholder="MRN-006" />
            </div>
            <div />
            <div className="space-y-2">
              <Label htmlFor="lastName">姓 *</Label>
              <Input id="lastName" name="lastName" required placeholder="山田" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">名 *</Label>
              <Input id="firstName" name="firstName" required placeholder="太郎" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastNameKana">姓（カナ）*</Label>
              <Input id="lastNameKana" name="lastNameKana" required placeholder="ヤマダ" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstNameKana">名（カナ）*</Label>
              <Input id="firstNameKana" name="firstNameKana" required placeholder="タロウ" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">生年月日 *</Label>
              <Input id="dob" name="dob" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">性別 *</Label>
              <Select name="gender" required defaultValue="male">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">血液型</Label>
              <Select name="bloodType" defaultValue="unknown">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A型</SelectItem>
                  <SelectItem value="B">B型</SelectItem>
                  <SelectItem value="O">O型</SelectItem>
                  <SelectItem value="AB">AB型</SelectItem>
                  <SelectItem value="unknown">不明</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input id="phone" name="phone" placeholder="03-1234-5678" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">住所</Label>
            <Input id="address" name="address" placeholder="東京都..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">緊急連絡先</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              placeholder="田中花子 (妻) 03-1234-5679"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insuranceNumber">保険証番号</Label>
            <Input
              id="insuranceNumber"
              name="insuranceNumber"
              placeholder="12345678901"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "登録中..." : "登録"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
