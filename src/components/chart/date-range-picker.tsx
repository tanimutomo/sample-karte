"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <Label className="sr-only">開始日</Label>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="w-auto h-8 text-sm"
      />
      <span className="text-muted-foreground">〜</span>
      <Label className="sr-only">終了日</Label>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="w-auto h-8 text-sm"
      />
    </div>
  );
}
