"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Vital } from "@/lib/types/database";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface VitalsChartProps {
  patientId: string;
  startDate: string;
  endDate: string;
}

interface VitalDataPoint {
  time: string;
  timestamp: number;
  body_temperature: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse: number | null;
  spo2: number | null;
}

export function VitalsChart({ patientId, startDate, endDate }: VitalsChartProps) {
  const [data, setData] = useState<VitalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchVitals = useCallback(async () => {
    setLoading(true);
    const startISO = new Date(startDate).toISOString();
    const endISO = new Date(endDate + "T23:59:59").toISOString();

    const { data: vitals } = await supabase
      .from("vitals")
      .select("*")
      .eq("patient_id", patientId)
      .gte("recorded_at", startISO)
      .lte("recorded_at", endISO)
      .order("recorded_at", { ascending: true });

    if (vitals) {
      const points: VitalDataPoint[] = vitals.map((v: Vital) => ({
        time: format(new Date(v.recorded_at), "MM/dd HH:mm"),
        timestamp: new Date(v.recorded_at).getTime(),
        body_temperature: v.body_temperature,
        blood_pressure_systolic: v.blood_pressure_systolic,
        blood_pressure_diastolic: v.blood_pressure_diastolic,
        pulse: v.pulse,
        spo2: v.spo2,
      }));
      setData(points);
    }
    setLoading(false);
  }, [patientId, startDate, endDate, supabase]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        この期間のバイタルデータはありません
      </div>
    );
  }

  const chartConfigs = [
    {
      title: "体温 (°C)",
      lines: [{ dataKey: "body_temperature", stroke: "#ef4444", name: "体温" }],
      yDomain: [35, 40] as [number, number],
    },
    {
      title: "血圧 (mmHg)",
      lines: [
        { dataKey: "blood_pressure_systolic", stroke: "#3b82f6", name: "収縮期" },
        { dataKey: "blood_pressure_diastolic", stroke: "#22c55e", name: "拡張期" },
      ],
      yDomain: [60, 200] as [number, number],
    },
    {
      title: "脈拍 (bpm)",
      lines: [{ dataKey: "pulse", stroke: "#f97316", name: "脈拍" }],
      yDomain: [40, 140] as [number, number],
    },
    {
      title: "SpO2 (%)",
      lines: [{ dataKey: "spo2", stroke: "#a855f7", name: "SpO2" }],
      yDomain: [80, 100] as [number, number],
    },
  ];

  return (
    <div className="space-y-4">
      {chartConfigs.map((config) => (
        <div key={config.title} className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">{config.title}</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={config.yDomain}
                tick={{ fontSize: 11 }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              {config.lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  name={line.name}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
