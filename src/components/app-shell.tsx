import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Coins,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { authStore, useAuth } from "@/lib/auth-store";
import { creditsStore, useCredits } from "@/lib/credits-store";
import { PLAN_LABEL } from "@/lib/credits";
import { auth } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Master Resume", icon: FileText },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-2" aria-label="Primary">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, plan, loaded } = useCredits();

  useEffect(() => {
    void creditsStore.refresh();
  }, []);

  async function handleLogout() {
    await auth.logout();
    authStore.clear();
    creditsStore.reset();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Link to="/dashboard" className="font-serif text-xl tracking-tight">
            Dromo
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to="/billing"
            className="mr-1 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs transition-colors hover:bg-accent"
            aria-label={`${balance} credits — ${PLAN_LABEL[plan]} plan`}
            title={`${PLAN_LABEL[plan]} plan`}
          >
            <Coins className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium tabular-nums">{loaded ? balance.toLocaleString() : "—"}</span>
            <span className="hidden text-muted-foreground sm:inline">credits</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {PLAN_LABEL[plan]}
            </span>
          </Link>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">
              {user?.name ?? "Sign out"}
            </span>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
          <SidebarLinks />
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <aside className="absolute left-0 top-14 h-[calc(100dvh-3.5rem)] w-64 border-r border-sidebar-border bg-sidebar shadow-deep">
              <SidebarLinks onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-h-[calc(100dvh-3.5rem)] flex-1">{children}</main>
      </div>
    </div>
  );
}
