"use client";

import { Button } from "@/components/ui/button";
import type { TimelineItemType } from "@/lib/types/database";
import {
  FileText,
  Heart,
  Pill,
  ClipboardList,
  FileCheck,
  BedDouble,
  ScrollText,
} from "lucide-react";

const filterOptions: {
  type: TimelineItemType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "progress_note", label: "経過記録", icon: FileText },
  { type: "vital", label: "バイタル", icon: Heart },
  { type: "prescription", label: "処方", icon: Pill },
  { type: "order", label: "オーダー", icon: ClipboardList },
  { type: "document", label: "文書", icon: FileCheck },
  { type: "admission", label: "入退院", icon: BedDouble },
  { type: "instruction", label: "指示", icon: ScrollText },
];

interface TimelineFiltersProps {
  activeFilters: Set<TimelineItemType>;
  onToggle: (type: TimelineItemType) => void;
}

export function TimelineFilters({ activeFilters, onToggle }: TimelineFiltersProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {filterOptions.map(({ type, label, icon: Icon }) => {
        const active = activeFilters.has(type);
        return (
          <Button
            key={type}
            variant={active ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => onToggle(type)}
          >
            <Icon className="h-3 w-3 mr-1" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
