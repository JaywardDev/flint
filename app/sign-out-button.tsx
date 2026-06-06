"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOut as signOutOfFlint } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    await signOutOfFlint();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isSigningOut}
      className="text-sm font-medium text-stone-600 transition hover:text-stone-950 disabled:cursor-not-allowed disabled:text-stone-400"
    >
      {isSigningOut ? "Signing out" : "Sign out"}
    </button>
  );
}
