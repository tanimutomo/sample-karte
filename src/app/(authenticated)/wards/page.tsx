"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Admission } from "@/lib/types/database";
import { WardBedMap } from "@/components/wards/ward-bed-map";

export default function WardsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admissions")
      .select("*, patients(*)")
      .eq("status", "admitted");
    if (data) setAdmissions(data as Admission[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">病棟管理</h1>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          読み込み中...
        </div>
      ) : (
        <WardBedMap admissions={admissions} />
      )}
    </div>
  );
}
