import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Linkedin, Chrome } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useReveal } from "@/hooks/use-reveal";
import { authStore, useAuth } from "@/lib/auth-store";
import { auth } from "@/lib/api";
import { USE_MOCKS } from "@/lib/api/client";
import { useTheme } from "@/lib/theme";
import type { OAuthProvider } from "@/lib/api/types";

export const Route = createFileRoute("/settings")({
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";

const PROVIDERS: { id: OAuthProvider; label: string; icon: typeof Github }[] = [
  { id: "google", label: "Google", icon: Chrome },
  { id: "github", label: "GitHub", icon: Github },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
];

function SettingsPage() {
  const ref = useReveal<HTMLDivElement>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name ?? "");
  const [connected, setConnected] = useState<Record<OAuthProvider, boolean>>({
    google: true,
    github: false,
    linkedin: false,
  });

  function saveProfile() {
    if (user) authStore.setUser({ ...user, name });
    toast.success("Profile saved");
  }

  async function deleteAccount() {
    await auth.logout();
    authStore.clear();
    toast.success("Account deleted");
    navigate({ to: "/login" });
  }

  return (
    <div ref={ref} className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Account, appearance, and integrations.
      </p>

      {/* Profile */}
      <SettingsSection title="Profile" description="How your name appears across Dromo.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" className="text-xs">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" value={user?.email ?? ""} readOnly disabled className="mt-1" />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={saveProfile} disabled={!name.trim() || name === user?.name}>
            Save changes
          </Button>
        </div>
      </SettingsSection>

      {/* Connected accounts */}
      <SettingsSection
        title="Connected accounts"
        description="Sign in faster and keep your profile in sync."
      >
        <ul className="divide-y divide-border">
          {PROVIDERS.map(({ id, label, icon: Icon }) => (
            <li key={id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {connected[id] ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <Switch
                checked={connected[id]}
                onCheckedChange={(v) => {
                  setConnected((c) => ({ ...c, [id]: v }));
                  toast.success(`${label} ${v ? "connected" : "disconnected"}`);
                }}
                aria-label={`Toggle ${label}`}
              />
            </li>
          ))}
        </ul>
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance" description="Dromo defaults to dark mode.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-muted-foreground">Toggle the interface theme.</p>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            aria-label="Toggle dark mode"
          />
        </div>
      </SettingsSection>

      {/* API connection */}
      <SettingsSection
        title="API connection"
        description="Where the app reads and writes data."
      >
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Base URL</dt>
            <dd className="truncate font-mono text-xs">{BASE_URL}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Mode</dt>
            <dd>
              <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-0.5 text-xs">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${USE_MOCKS ? "bg-muted-foreground" : "bg-foreground"}`}
                />
                {USE_MOCKS ? "Mock data" : "Live API"}
              </span>
            </dd>
          </div>
        </dl>
      </SettingsSection>

      {/* Danger zone */}
      <div className="mt-8 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-semibold">Danger zone</h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all generated documents.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes your master resume and all sessions. This can&apos;t be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAccount}>Delete account</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
