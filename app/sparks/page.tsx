import { requireUser } from "@/lib/auth/server";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";

export default async function SparksPage() {
  await requireUser();

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-28 pt-10 sm:pb-10">
        <AppHeader
          links={[
            { href: "/records", label: "Records" },
            { href: "/timeline", label: "Timeline" },
            { href: "/add", label: "Add" },
            { href: "/search", label: "Search" },
          ]}
        />

        <section aria-labelledby="sparks-heading">
          <div className="mb-5 flex items-center gap-4">
            <h1
              id="sparks-heading"
              className="text-xs font-medium uppercase tracking-[0.18em] text-stone-soft"
            >
              Sparks
            </h1>
            <span className="h-px flex-1 bg-parchment-border" aria-hidden />
          </div>

          <div className="flex flex-col items-center rounded-xl border border-parchment-border bg-parchment-raised px-6 py-16 text-center">
            <span
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-full bg-parchment text-ember"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.5 13.9 9.3 21 12 13.9 14.7 12 21.5 10.1 14.7 3 12 10.1 9.3z" />
              </svg>
            </span>
            <h2 className="mt-5 font-serif text-2xl text-obsidian">
              Sparks are coming
            </h2>
            <p className="mt-3 max-w-md leading-7 text-stone-warm">
              As your records grow, Flint will start noticing patterns — people,
              places, and events that belong together. That’s a Spark.
            </p>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
