import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";
import { Reveal } from "./reveal";

export function Cta() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative overflow-hidden border-t border-border py-28 sm:py-36">
      <div className="aura absolute inset-0 -z-10" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-50" />

      <Reveal
        stagger={0.1}
        className="mx-auto max-w-3xl px-5 text-center sm:px-8"
      >
        <h2 className="display-xl text-balance">
          Stop reformatting. Start interviewing.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          Upload your resume once and let Dromo handle the tailoring for every
          job you chase. Your next application is sixty seconds away.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="group w-full sm:w-auto">
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              {isAuthenticated ? "Go to dashboard" : "Get started free"}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
