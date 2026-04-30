"use client";

import type {
  TimelineItem,
  ProgressNote,
  Vital,
  Prescription,
  Order,
  Document,
  Admission,
  Instruction,
  InstructionType,
} from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  FileText,
  Heart,
  Pill,
  ClipboardList,
  FileCheck,
  BedDouble,
  ScrollText,
} from "lucide-react";
import { OrderStatusUpdate } from "@/components/records/order-status-update";

const typeConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  progress_note: { label: "経過記録", icon: FileText, color: "bg-blue-500" },
  vital: { label: "バイタル", icon: Heart, color: "bg-red-500" },
  prescription: { label: "処方", icon: Pill, color: "bg-green-500" },
  order: { label: "オーダー", icon: ClipboardList, color: "bg-amber-500" },
  document: { label: "文書", icon: FileCheck, color: "bg-purple-500" },
  admission: { label: "入退院", icon: BedDouble, color: "bg-teal-500" },
  instruction: { label: "指示", icon: ScrollText, color: "bg-cyan-500" },
};

const noteTypeLabel: Record<string, string> = {
  doctor: "医師記録",
  nursing: "看護記録",
  rehab: "リハビリ記録",
  msw: "MSW記録",
};

const orderTypeLabel: Record<string, string> = {
  lab: "検査",
  imaging: "画像",
  procedure: "処置",
  other: "その他",
};

const orderStatusLabel: Record<string, string> = {
  pending: "依頼中",
  completed: "完了",
  cancelled: "中止",
};

const documentTypeLabel: Record<string, string> = {
  discharge_summary: "退院サマリー",
  referral_letter: "診療情報提供書",
  other: "その他",
};

const routeLabel: Record<string, string> = {
  oral: "経口",
  iv: "静注",
  im: "筋注",
  sc: "皮下注",
  topical: "外用",
  inhalation: "吸入",
  other: "その他",
};

function ProgressNoteContent({ data }: { data: ProgressNote }) {
  return (
    <div className="space-y-2 text-sm">
      <Badge variant="outline">{noteTypeLabel[data.note_type]}</Badge>
      {data.subjective && (
        <div>
          <span className="font-semibold text-blue-600">S:</span>{" "}
          <span className="whitespace-pre-wrap">{data.subjective}</span>
        </div>
      )}
      {data.objective && (
        <div>
          <span className="font-semibold text-green-600">O:</span>{" "}
          <span className="whitespace-pre-wrap">{data.objective}</span>
        </div>
      )}
      {data.assessment && (
        <div>
          <span className="font-semibold text-amber-600">A:</span>{" "}
          <span className="whitespace-pre-wrap">{data.assessment}</span>
        </div>
      )}
      {data.plan && (
        <div>
          <span className="font-semibold text-red-600">P:</span>{" "}
          <span className="whitespace-pre-wrap">{data.plan}</span>
        </div>
      )}
    </div>
  );
}

function VitalContent({ data }: { data: Vital }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
      {data.body_temperature != null && (
        <div>
          <span className="text-muted-foreground">体温:</span>{" "}
          <span className="font-medium">{data.body_temperature}°C</span>
        </div>
      )}
      {data.blood_pressure_systolic != null && (
        <div>
          <span className="text-muted-foreground">血圧:</span>{" "}
          <span className="font-medium">
            {data.blood_pressure_systolic}/{data.blood_pressure_diastolic} mmHg
          </span>
        </div>
      )}
      {data.pulse != null && (
        <div>
          <span className="text-muted-foreground">脈拍:</span>{" "}
          <span className="font-medium">{data.pulse} bpm</span>
        </div>
      )}
      {data.spo2 != null && (
        <div>
          <span className="text-muted-foreground">SpO2:</span>{" "}
          <span className="font-medium">{data.spo2}%</span>
        </div>
      )}
      {data.respiration_rate != null && (
        <div>
          <span className="text-muted-foreground">呼吸数:</span>{" "}
          <span className="font-medium">{data.respiration_rate} /min</span>
        </div>
      )}
      {data.consciousness_level && (
        <div>
          <span className="text-muted-foreground">意識:</span>{" "}
          <span className="font-medium">{data.consciousness_level}</span>
        </div>
      )}
      {data.notes && (
        <div className="col-span-full">
          <span className="text-muted-foreground">備考:</span> {data.notes}
        </div>
      )}
    </div>
  );
}

function PrescriptionContent({ data }: { data: Prescription }) {
  return (
    <div className="text-sm space-y-1">
      <div className="font-medium">{data.medication_name}</div>
      <div className="text-muted-foreground">
        {data.dosage} {data.unit} / {data.frequency} / {routeLabel[data.route]}
      </div>
      <div className="text-muted-foreground">
        開始: {format(new Date(data.start_date), "yyyy/MM/dd")}
        {data.end_date && ` 〜 終了: ${format(new Date(data.end_date), "yyyy/MM/dd")}`}
      </div>
      {data.notes && <div className="text-muted-foreground">備考: {data.notes}</div>}
    </div>
  );
}

function OrderContent({
  data,
  onRefresh,
}: {
  data: Order;
  onRefresh?: () => void;
}) {
  return (
    <div className="text-sm space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{orderTypeLabel[data.order_type]}</Badge>
        <Badge
          variant={
            data.status === "completed"
              ? "default"
              : data.status === "cancelled"
                ? "destructive"
                : "secondary"
          }
        >
          {orderStatusLabel[data.status]}
        </Badge>
        {data.status === "pending" && onRefresh && (
          <OrderStatusUpdate
            orderId={data.id}
            currentStatus={data.status}
            onUpdated={onRefresh}
          />
        )}
      </div>
      <div className="font-medium">{data.title}</div>
      {data.details && (
        <div className="text-muted-foreground whitespace-pre-wrap">{data.details}</div>
      )}
    </div>
  );
}

function DocumentContent({ data }: { data: Document }) {
  return (
    <div className="text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{documentTypeLabel[data.document_type]}</Badge>
        {data.content && (
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm" className="h-7">
                  <FileCheck className="h-3.5 w-3.5" />
                  文書を見る
                </Button>
              }
            />
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{data.title}</DialogTitle>
              </DialogHeader>
              <div className="text-sm whitespace-pre-wrap">{data.content}</div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="font-medium">{data.title}</div>
    </div>
  );
}

const instructionTypeLabel: Record<InstructionType, string> = {
  activity: "安静度",
  diet: "食事",
  iv: "輸液",
  oxygen: "酸素",
  monitoring: "観察",
  other: "その他",
};

const instructionTypeColor: Record<InstructionType, string> = {
  activity: "bg-blue-100 text-blue-800",
  diet: "bg-green-100 text-green-800",
  iv: "bg-purple-100 text-purple-800",
  oxygen: "bg-red-100 text-red-800",
  monitoring: "bg-amber-100 text-amber-800",
  other: "bg-gray-100 text-gray-800",
};

function InstructionContent({ data }: { data: Instruction }) {
  return (
    <div className="text-sm space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${instructionTypeColor[data.instruction_type]}`}
        >
          {instructionTypeLabel[data.instruction_type]}
        </span>
        <Badge variant={data.is_active ? "default" : "secondary"}>
          {data.is_active ? "アクティブ" : "中止"}
        </Badge>
      </div>
      <div>{data.content}</div>
      <div className="text-xs text-muted-foreground">
        {format(new Date(data.start_date), "yyyy/MM/dd")} 〜{" "}
        {data.end_date
          ? format(new Date(data.end_date), "yyyy/MM/dd")
          : "継続中"}
      </div>
    </div>
  );
}

const admissionStatusLabel: Record<string, string> = {
  admitted: "入院中",
  discharged: "退院済",
  transferred: "転棟済",
};

function AdmissionContent({ data }: { data: Admission }) {
  return (
    <div className="text-sm space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {data.ward}病棟 {data.room}号室 {data.bed_number}ベッド
        </span>
        <Badge
          variant={
            data.status === "admitted"
              ? "default"
              : data.status === "discharged"
                ? "secondary"
                : "outline"
          }
          className={
            data.status === "admitted"
              ? "bg-blue-600"
              : data.status === "discharged"
                ? "bg-green-600 text-white"
                : "bg-amber-500 text-white"
          }
        >
          {admissionStatusLabel[data.status]}
        </Badge>
      </div>
      <div className="text-muted-foreground">
        入院日: {format(new Date(data.admission_date), "yyyy/MM/dd HH:mm")}
      </div>
      {data.discharge_date && (
        <div className="text-muted-foreground">
          退院日: {format(new Date(data.discharge_date), "yyyy/MM/dd HH:mm")}
        </div>
      )}
      {data.notes && (
        <div className="text-muted-foreground whitespace-pre-wrap">{data.notes}</div>
      )}
    </div>
  );
}

interface TimelineItemCardProps {
  item: TimelineItem;
  onRefresh?: () => void;
}

export function TimelineItemCard({ item, onRefresh }: TimelineItemCardProps) {
  const config = typeConfig[item.type];
  const Icon = config.icon;
  const createdAt = format(new Date(item.created_at), "yyyy/MM/dd HH:mm", {
    locale: ja,
  });

  const profileName =
    "profiles" in item.data && item.data.profiles
      ? item.data.profiles.display_name
      : null;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-8 w-8 rounded-full ${config.color} flex items-center justify-center shrink-0`}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="w-px flex-1 bg-border" />
      </div>
      <Card className="flex-1 mb-4">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {config.label}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {profileName && <span>{profileName}</span>}
              <span>{createdAt}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          {item.type === "progress_note" && (
            <ProgressNoteContent data={item.data as ProgressNote} />
          )}
          {item.type === "vital" && (
            <VitalContent data={item.data as Vital} />
          )}
          {item.type === "prescription" && (
            <PrescriptionContent data={item.data as Prescription} />
          )}
          {item.type === "order" && (
            <OrderContent data={item.data as Order} onRefresh={onRefresh} />
          )}
          {item.type === "document" && (
            <DocumentContent data={item.data as Document} />
          )}
          {item.type === "admission" && (
            <AdmissionContent data={item.data as Admission} />
          )}
          {item.type === "instruction" && (
            <InstructionContent data={item.data as Instruction} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
