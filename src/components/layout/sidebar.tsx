"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, ScrollText, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
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

function NavLinks({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
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

export function Sidebar() {
  const { open, setOpen, collapsed, setCollapsed } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background shrink-0 transition-[width] duration-200",
          collapsed ? "w-14" : "w-56"
        )}
      >
        <div className="flex-1 pt-2">
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
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">ナビゲーション</SheetTitle>
          <SheetDescription className="sr-only">
            サイドバーナビゲーション
          </SheetDescription>
          <div className="pt-12">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
