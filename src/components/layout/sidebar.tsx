"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Building2,
  ScrollText,
  PanelLeftClose,
  PanelLeft,
  FileHeart,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "./sidebar-context";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "患者一覧", href: "/patients", icon: Users },
  { label: "病棟管理", href: "/wards", icon: Building2 },
  { label: "指示簿管理", href: "/instructions", icon: ScrollText },
];

function Logo({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/patients")}
      className="flex items-center gap-2 px-3 py-3 font-semibold text-lg hover:opacity-80 transition-opacity"
    >
      <FileHeart className="h-6 w-6 text-primary shrink-0" />
      {!collapsed && <span>電子カルテ</span>}
    </button>
  );
}

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "");
        setUserName(
          user.user_metadata?.display_name ?? user.email ?? ""
        );
      }
    }
    fetchUser();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="border-t p-2 space-y-2">
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md",
          collapsed && "justify-center"
        )}
      >
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{userName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {userEmail}
            </div>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full text-muted-foreground hover:text-destructive",
          collapsed ? "justify-center" : "justify-start"
        )}
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="ml-2">ログアウト</span>}
      </Button>
    </div>
  );
}

export function Sidebar() {
  const { open, setOpen, collapsed, setCollapsed } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background shrink-0 sticky top-0 h-screen transition-[width] duration-200",
          collapsed ? "w-14" : "w-56"
        )}
      >
        <div className="border-b">
          <Logo collapsed={collapsed} />
        </div>
        <div className="flex-1 pt-2 overflow-y-auto">
          <NavLinks collapsed={collapsed} />
        </div>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <UserFooter collapsed={collapsed} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetTitle className="sr-only">ナビゲーション</SheetTitle>
          <SheetDescription className="sr-only">
            サイドバーナビゲーション
          </SheetDescription>
          <div className="border-b">
            <Logo />
          </div>
          <div className="flex-1">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <UserFooter />
        </SheetContent>
      </Sheet>
    </>
  );
}

/** モバイル用の最小トップバー（ハンバーガーのみ） */
export function MobileTopBar() {
  const { setOpen } = useSidebar();
  return (
    <div className="md:hidden sticky top-0 z-50 flex items-center h-12 px-3 border-b bg-background/95 backdrop-blur">
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">メニューを開く</span>
      </Button>
      <button
        className="flex items-center gap-2 ml-2 font-semibold hover:opacity-80"
        onClick={() => setOpen(true)}
      >
        <FileHeart className="h-5 w-5 text-primary" />
        <span>電子カルテ</span>
      </button>
    </div>
  );
}
