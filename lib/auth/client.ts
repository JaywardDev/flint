"use client";

import { createClient } from "@/lib/supabase/client";

export function getCurrentSession() {
  return createClient().auth.getSession();
}

export function signInWithEmail(email: string, password: string) {
  return createClient().auth.signInWithPassword({ email, password });
}

export function signUpWithEmail(email: string, password: string) {
  return createClient().auth.signUp({ email, password });
}

export function signOut() {
  return createClient().auth.signOut();
}
