import { requireUser } from "@/lib/auth/server";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";
import { CaptureBox } from "../capture-box";

export default async function AddPage() {
  await requireUser();

  return (
    <>
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-28 pt-10 sm:pb-10">
      <AppHeader
        links={[
          { href: "/records", label: "Records" },
          { href: "/search", label: "Search" },
        ]}
      />

      <section aria-labelledby="add-heading">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-soft">
          Add
        </p>
        <h1 id="add-heading" className="mt-3 font-serif text-3xl text-obsidian">
          One small thing worth remembering.
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-warm">
          Capture it quickly. Flint keeps you here so the next note is ready.
        </p>
        <div className="mt-6">
          <CaptureBox />
        </div>
      </section>
    </main>
    <BottomNav />
    </>
  );
}
