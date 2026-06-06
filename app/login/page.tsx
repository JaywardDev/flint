import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/server";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
          Flint
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
          Sign in to Flint
        </h1>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Your records are private to you.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
