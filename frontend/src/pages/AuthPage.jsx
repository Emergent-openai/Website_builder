import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { AuthShowcaseWall } from "@/components/auth/AuthShowcaseWall";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/errorMessage";
import { toast } from "@/components/ui/sonner";


const AUTH_BACKGROUND_IMAGE_URL = "https://customer-assets-staging.emergentagent.com/job_quick-site-builder/artifacts/youjmxa6_Screenshot%202026-03-05%20at%207.17.06%E2%80%AFPM.png";


const initialFormState = {
  name: "",
  email: "",
  password: "",
};


export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [formState, setFormState] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [field]: value,
    }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setFormState((currentFormState) => ({
      ...currentFormState,
      password: "",
      ...(nextMode === "login" ? { name: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.email.trim() || !formState.password.trim() || (mode === "signup" && !formState.name.trim())) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "signup") {
        await signup({
          name: formState.name,
          email: formState.email,
          password: formState.password,
        });
        toast.success("Account created. Your workspace is ready.");
      } else {
        await login({
          email: formState.email,
          password: formState.password,
        });
        toast.success("Welcome back. Opening your projects.");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Authentication failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="builder-shell auth-page-shell min-h-screen text-white" data-testid="auth-page">
      <div className="auth-page-backdrop" aria-hidden="true">
        <img
          src={AUTH_BACKGROUND_IMAGE_URL}
          alt=""
          className="auth-page-backdrop-image"
          data-testid="auth-background-image"
        />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 py-10 md:px-8 md:py-14">
        <section className="auth-center-stage w-full max-w-[620px]" data-testid="auth-main-section">
          <div className="mb-8 text-center md:mb-10" data-testid="auth-header">
            <div
              className="mx-auto mb-6 inline-flex items-center justify-center rounded-[1.15rem] border border-white/15 bg-black/35 px-4 py-3 shadow-[0_18px_42px_rgba(2,6,23,0.34)]"
              data-testid="auth-brand-logo-shell"
            >
              <img
                src="/website-builder-logo.png"
                alt="Website builder logo"
                className="h-[58px] w-auto md:h-[70px]"
                data-testid="auth-brand-logo-image"
              />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-zinc-500" data-testid="auth-brand-label">
              Website builder
            </p>
            <h1 className="mx-auto mt-5 max-w-4xl font-heading text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-white md:text-5xl" data-testid="auth-brand-title">
              Website builder.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg" data-testid="auth-brand-description">
              Sign in or create your account to manage multi-page projects, premium section systems, and saved builder progress.
            </p>
          </div>

          <AuthFormCard
            mode={mode}
            onModeChange={handleModeChange}
            formState={formState}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </section>

        <AuthShowcaseWall />
      </main>
    </div>
  );
}