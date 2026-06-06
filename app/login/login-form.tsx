"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { signInWithEmail, signUpWithEmail } from "@/lib/auth/client";

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
      setMessage(error.message);
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
      <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-2xl border border-stone-200 px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="password">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          className="rounded-2xl border border-stone-200 px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
        />
      </label>

      {message ? (
        <p className="rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
      >
        {isSubmitting ? "Please wait" : isSignUp ? "Sign up" : "Log in"}
      </button>

      <button
        type="button"
        onClick={() => {
          setIsSignUp((current) => !current);
          setMessage(null);
        }}
        className="text-sm font-medium text-stone-600 transition hover:text-stone-950"
      >
        {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
      </button>
    </form>
  );
}
