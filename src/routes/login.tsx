import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";

import { AuthCard } from "@/components/auth-card";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/api";
import { authStore } from "@/lib/auth-store";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { status, isAuthenticated } = useAuth();
  const [magicSent, setMagicSent] = useState<string | null>(null);
  const [magicLoading, setMagicLoading] = useState(false);

  useEffect(() => {
    if (status === "ready" && isAuthenticated) navigate({ to: "/dashboard" });
  }, [status, isAuthenticated, navigate]);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormVals) {
    try {
      const user = await auth.login(values.email, values.password);
      authStore.setUser(user);
      navigate({ to: user.hasMasterResume ? "/dashboard" : "/onboarding" });
    } catch (e) {
      toast.error("Couldn't sign you in. Check your details and try again.");
    }
  }

  async function sendMagic() {
    const email = form.getValues("email");
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      form.setError("email", { message: "Enter an email first" });
      return;
    }
    try {
      setMagicLoading(true);
      await auth.magicLink(email);
      setMagicSent(email);
    } catch {
      toast.error("Couldn't send the link. Try again.");
    } finally {
      setMagicLoading(false);
    }
  }

  if (magicSent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`We sent a sign-in link to ${magicSent}`}
        footer={
          <button
            className="underline-offset-4 hover:underline"
            onClick={() => setMagicSent(null)}
          >
            Use a different method
          </button>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-sm text-muted-foreground">
          <Mail className="h-6 w-6" aria-hidden />
          <p>The link expires in 15 minutes.</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue tailoring."
      footer={
        <>
          No account?{" "}
          <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("email")}
            aria-invalid={!!form.formState.errors.email}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-muted-foreground" role="alert">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.register("password")}
            aria-invalid={!!form.formState.errors.password}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-muted-foreground" role="alert">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={sendMagic}
          disabled={magicLoading}
        >
          {magicLoading ? "Sending…" : "Email me a magic link instead"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <OAuthButtons />
    </AuthCard>
  );
}
