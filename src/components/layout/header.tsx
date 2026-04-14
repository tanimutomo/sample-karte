"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, FileHeart, Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function AppHeader() {
  const router = useRouter();
  const supabase = createClient();
  const { setOpen } = useSidebar();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </Button>
        <button
          onClick={() => router.push("/patients")}
          className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          <FileHeart className="h-6 w-6 text-primary" />
          <span>電子カルテ</span>
        </button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-1" />
          ログアウト
        </Button>
      </div>
    </header>
  );
}
