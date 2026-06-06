"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { signInWithEmail, signUpWithEmail } from "@/lib/auth/client";

function friendlyAuthError(rawMessage: string) {
  const message = rawMessage.toLowerCase();

  if (message.includes("rate") || message.includes("too many")) {
    return "Too many attempts. Try again shortly.";
  }

  if (
    message.includes("invalid login") ||
    message.includes("invalid credentials") ||
    message.includes("invalid email or password")
  ) {
    return "That email or password didn’t work.";
  }

  if (message.includes("already registered") || message.includes("already exists")) {
    return "That email is already registered. Sign in instead.";
  }

  if (message.includes("confirm")) {
    return "Check your email to finish signing up.";
  }

  return "Something went wrong. Try again.";
}

export function LoginForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const { data, error } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    setIsSubmitting(false);

    if (error) {
      setMessage(friendlyAuthError(error.message));
      return;
    }

    if (isSignUp && !data.session) {
      setMessage("Check your email to finish signing up.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium text-stone-warm" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base text-obsidian outline-none transition placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-stone-warm" htmlFor="password">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          className="rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base text-obsidian outline-none transition placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
        />
      </label>

      {message ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-sm text-obsidian"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-obsidian px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-obsidian/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-raised disabled:cursor-not-allowed disabled:bg-stone-warm"
      >
        {isSubmitting
          ? isSignUp
            ? "Creating your account…"
            : "Signing in…"
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </button>

      <button
        type="button"
        onClick={() => {
          setIsSignUp((current) => !current);
          setMessage(null);
        }}
        className="text-sm font-medium text-stone-warm transition hover:text-obsidian"
      >
        {isSignUp ? "Already have an account? Sign in" : "Need an account? Create one"}
      </button>
    </form>
  );
}
