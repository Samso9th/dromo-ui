import * as React from "react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { auth, oauthUrl } from "@/lib/api";
import { USE_MOCKS } from "@/lib/api/client";
import { authStore } from "@/lib/auth-store";
import type { OAuthProvider } from "@/lib/api/types";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M21.6 12.227c0-.682-.061-1.337-.176-1.964H12v3.71h5.382a4.605 4.605 0 0 1-1.998 3.022v2.51h3.232c1.89-1.74 2.984-4.305 2.984-7.278zM12 22c2.7 0 4.964-.895 6.619-2.422l-3.232-2.51c-.896.6-2.043.954-3.387.954-2.605 0-4.81-1.76-5.598-4.123H3.064v2.59A9.997 9.997 0 0 0 12 22zM6.402 13.9A5.99 5.99 0 0 1 6.09 12c0-.659.114-1.3.312-1.9V7.51H3.064A9.996 9.996 0 0 0 2 12c0 1.614.386 3.14 1.064 4.49l3.338-2.59zM12 5.977c1.47 0 2.787.505 3.824 1.498l2.868-2.868C16.96 2.99 14.696 2 12 2 8.094 2 4.71 4.245 3.064 7.51l3.338 2.59C7.19 7.737 9.395 5.977 12 5.977z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.71 1.25 3.37.95.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.19 1.18a11.05 11.05 0 0 1 5.81 0c2.22-1.49 3.19-1.18 3.19-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.77 1.06.77 2.14v3.17c0 .31.21.67.8.56A11.52 11.52 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.38 4.27 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const PROVIDERS: {
  id: OAuthProvider;
  label: string;
  Icon: () => React.ReactElement;
}[] = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "github", label: "GitHub", Icon: GitHubIcon },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
];

export function OAuthButtons() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<OAuthProvider | null>(null);

  async function handle(p: OAuthProvider) {
    if (!USE_MOCKS) {
      // Real OAuth is a full-page redirect; the backend sets cookies and returns to /dashboard.
      setBusy(p);
      window.location.href = oauthUrl(p);
      return;
    }
    try {
      setBusy(p);
      const user = await auth.oauthStart(p);
      authStore.setUser(user);
      navigate({ to: user.hasMasterResume ? "/dashboard" : "/onboarding" });
    } catch (e) {
      toast.error(`Couldn't continue with ${p}`);
      setBusy(null);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          onClick={() => handle(id)}
          disabled={!!busy}
          aria-label={`Continue with ${label}`}
          className="h-10 gap-2"
        >
          <Icon />
          <span className="sr-only sm:not-sr-only sm:inline text-xs">
            {label}
          </span>
        </Button>
      ))}
    </div>
  );
}
