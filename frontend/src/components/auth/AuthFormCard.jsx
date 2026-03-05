import { Loader2, LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";


export const AuthFormCard = ({ mode, onModeChange, formState, onFieldChange, onSubmit, submitting }) => {
  const isSignup = mode === "signup";

  return (
    <section className="panel-shell auth-focus-card rounded-[2.5rem] px-6 py-7 md:px-8 md:py-8" data-testid="auth-form-card">
      <div className="text-center">
        <span className="premium-pill inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-200" data-testid="auth-form-badge">
          Secure workspace
        </span>

        <h2 className="mt-6 font-heading text-3xl font-semibold tracking-[-0.04em] text-white md:text-[2.35rem]" data-testid="auth-form-title">
          {isSignup ? "Create your builder account." : "Welcome back."}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-400 md:text-base" data-testid="auth-form-description">
          {isSignup
            ? "Create an account to save projects, return to your builder instantly, and keep every website draft in one place."
            : "Log in to continue building multi-page websites with inline editing, premium sections, and saved progress."}
        </p>

        <div className="control-surface mx-auto mt-6 inline-flex items-center gap-2 rounded-full p-1.5" data-testid="auth-mode-toggle">
          {[
            { value: "login", label: "Log in" },
            { value: "signup", label: "Sign up" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onModeChange(item.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-[transform,background-color,color,box-shadow] duration-200",
                mode === item.value
                  ? "bg-white text-zinc-950 shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
                  : "text-zinc-300 hover:-translate-y-0.5 hover:bg-white/8 hover:text-white"
              )}
              data-testid={`auth-mode-button-${item.value}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" data-testid="auth-form">
        {isSignup ? (
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500" htmlFor="auth-name-input">
              Full name
            </label>
            <Input
              id="auth-name-input"
              value={formState.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              placeholder="Avery Quinn"
              className="premium-input h-14 rounded-[1.65rem] border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
              data-testid="auth-name-input"
            />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500" htmlFor="auth-email-input">
            Email
          </label>
          <Input
            id="auth-email-input"
            type="email"
            value={formState.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            placeholder="you@studio.com"
            className="premium-input h-14 rounded-[1.65rem] border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
            data-testid="auth-email-input"
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500" htmlFor="auth-password-input">
            Password
          </label>
          <Input
            id="auth-password-input"
            type="password"
            value={formState.password}
            onChange={(event) => onFieldChange("password", event.target.value)}
            placeholder={isSignup ? "Minimum 8 characters" : "Enter your password"}
            className="premium-input h-14 rounded-[1.65rem] border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
            data-testid="auth-password-input"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="button-premium-primary mt-2 h-14 w-full rounded-[1.65rem] text-white"
          data-testid="auth-submit-button"
        >
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isSignup ? <Sparkles className="mr-2 h-4 w-4" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
          {isSignup ? "Create account" : "Log in"}
        </Button>
      </form>

      <div className="mt-6 text-center" data-testid="auth-trust-panel">
        <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500">Protected access</p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-400" data-testid="auth-trust-copy">
          Your dashboard, projects, and section edits stay tied to your account and are ready when you return.
        </p>
      </div>
    </section>
  );
};