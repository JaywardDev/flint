import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/server";

import { EmberDivider, Wordmark } from "../wordmark";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Wordmark className="text-2xl" />
        <EmberDivider className="mt-5" />
        <p className="mt-5 font-serif text-sm italic text-stone-warm">
          Collect the sparks. Discover the fire.
        </p>
      </div>

      <div className="rounded-2xl border border-parchment-border bg-parchment-raised p-6 sm:p-8">
        <h1 className="font-serif text-2xl text-obsidian">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-stone-warm">
          Your records are private to you.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
