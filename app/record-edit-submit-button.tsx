"use client";

import { useFormStatus } from "react-dom";

export function RecordEditSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-obsidian px-5 py-2.5 text-sm font-semibold text-parchment transition hover:bg-obsidian/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed disabled:bg-stone-warm/40 disabled:text-parchment/70"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
