"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TimelineItem, TimelineItemType } from "@/lib/types/database";
import { TimelineItemCard } from "./timeline-item";
import { TimelineFilters } from "./timeline-filters";

interface TimelineProps {
  patientId: string;
  refreshKey: number;
  startDate: string;
  endDate: string;
}

export function Timeline({ patientId, refreshKey, startDate, endDate }: TimelineProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<TimelineItemType>>(
    new Set(["progress_note", "vital", "prescription", "order", "document", "admission", "instruction"])
  );
  const supabase = createClient();

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    const results: TimelineItem[] = [];
    const start = new Date(startDate).toISOString();
    const end = new Date(endDate + "T23:59:59").toISOString();

    const fetches: PromiseLike<void>[] = [];

    if (activeFilters.has("progress_note")) {
      fetches.push(
        supabase
          .from("progress_notes")
          .select("*, profiles(*)")
          .eq("patient_id", patientId)
          .gte("created_at", start)
          .lte("created_at", end)
          .order("created_at", { ascending: false })
          .then(({ data }: { data: any[] | null }) => {
            data?.forEach((d: any) =>
              results.push({
                id: d.id,
                type: "progress_note",
                created_at: d.created_at,
                data: d,
              })
            );
          })
      );
    }

    if (activeFilters.has("vital")) {
      fetches.push(
        supabase
          .from("vitals")
          .select("*, profiles(*)")
          .eq("patient_id", patientId)
          .gte("recorded_at", start)
          .lte("recorded_at", end)
          .order("recorded_at", { ascending: false })
          .then(({ data }: { data: any[] | null }) => {
            data?.forEach((d: any) =>
              results.push({
                id: d.id,
                type: "vital",
                created_at: d.recorded_at,
                data: d,
              })
            );
          })
      );
    }

    if (activeFilters.has("prescription")) {
      fetches.push(
        supabase
          .from("prescriptions")
          .select("*, profiles(*)")
          .eq("patient_id", patientId)
          .gte("created_at", start)
          .lte("created_at", end)
          .order("created_at", { ascending: false })
          .then(({ data }: { data: any[] | null }) => {
            data?.forEach((d: any) =>
              results.push({
                id: d.id,
                type: "prescription",
                created_at: d.created_at,
                data: d,
              })
            );
          })
      );
    }

    if (activeFilters.has("order")) {
      fetches.push(
        supabase
          .from("orders")
          .select("*, profiles(*)")
          .eq("patient_id", patientId)
          .gte("created_at", start)
          .lte("created_at", end)
          .order("created_at", { ascending: false })
          .then(({ data }: { data: any[] | null }) => {
            data?.forEach((d: any) =>
              results.push({
                id: d.id,
                type: "order",
                created_at: d.created_at,
                data: d,
              })
            );
          })
      );
    }

    if (activeFilters.has("document")) {
      fetches.push(
        supabase
          .from("documents")
          .select("*, profiles(*)")
          .eq("patient_id", patientId)
          .gte("created_at", start)
          .lte("created_at", end)
          .order("created_at", { ascending: false })
          .then(({ data }: { data: any[] | null }) => {
            data?.forEach((d: any) =>
              results.push({
                id: d.id,
                type: "document",
                created_at: d.created_at,
                data: d,
              })
            );
          })
      );
    }

    if (activeFilters.has("admission")) {
      fetches.push(
        supabase
          .from("admissions")
          .select("*, profiles(*)")
          .eq("patient_id", patientId)
          .gte("created_at", start)
          .lte("created_at", end)
          .order("created_at", { ascending: false })
          .then(({ data }: { data: any[] | null }) => {
            data?.forEach((d: any) =>
              results.push({
                id: d.id,
                type: "admission",
                created_at: d.created_at,
                data: d,
              })
            );
          })
      );
    }

    if (activeFilters.has("instruction")) {
      fetches.push(
        supabase
          .from("instructions")
          .select("*, profiles(*)")
          .eq("patient_id", patientId)
          .gte("created_at", start)
          .lte("created_at", end)
          .order("created_at", { ascending: false })
          .then(({ data }: { data: any[] | null }) => {
            data?.forEach((d: any) =>
              results.push({
                id: d.id,
                type: "instruction",
                created_at: d.created_at,
                data: d,
              })
            );
          })
      );
    }

    await Promise.all(fetches);
    results.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setItems(results);
    setLoading(false);
  }, [patientId, activeFilters, startDate, endDate, supabase, refreshKey]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  function handleToggle(type: TimelineItemType) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <TimelineFilters activeFilters={activeFilters} onToggle={handleToggle} />
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          読み込み中...
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          この期間の記録はありません
        </div>
      ) : (
        <div className="space-y-0">
          {items.map((item) => (
            <TimelineItemCard key={`${item.type}-${item.id}`} item={item} onRefresh={fetchTimeline} />
          ))}
        </div>
      )}
    </div>
  );
}
