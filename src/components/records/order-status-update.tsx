"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  onUpdated: () => void;
}

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  onUpdated,
}: OrderStatusUpdateProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (currentStatus !== "pending") {
    return null;
  }

  async function handleStatusChange(status: "completed" | "cancelled") {
    setLoading(true);
    try {
      await supabase
        .from("orders")
        .update({
          status,
          completed_at:
            status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", orderId);
      onUpdated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        render={
          <Button variant="ghost" size="icon-xs">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">ステータス変更</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          完了にする
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
          <XCircle className="h-4 w-4 text-red-600" />
          中止にする
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
