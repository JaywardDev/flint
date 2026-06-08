import Link from "next/link";

import { requireUser } from "@/lib/auth/server";
import {
  groupFlintRecordsByEra,
  listFlintRecordsByYear,
} from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";
import { EraRail, UndatedMarkers } from "./timeline-markers";

function countLabel(count: number) {
  return `${count} ${count === 1 ? "record" : "records"}`;
}

export default async function TimelinePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const records = await listFlintRecordsByYear(recordsClient, user.id);
  const groups = groupFlintRecordsByEra(records);

  // The density bar spans history left→right (oldest → now), so it excludes the
  // Undated catch-all and keeps chronological order.
  const eraSegments = groups.filter((group) => group.id !== "undated");
  const maxCount = Math.max(1, ...eraSegments.map((group) => group.records.length));

  // The list reads newest era first (most recent at the top), with the Undated
  // catch-all kept last. The density bar above stays chronological, so the two
  // run in opposite directions by design.
  const datedGroups = groups.filter((group) => group.id !== "undated");
  const undatedGroup = groups.find((group) => group.id === "undated");
  const listGroups = [...datedGroups].reverse();
  if (undatedGroup) {
    listGroups.push(undatedGroup);
  }

  // Terra incognita prompt: the deep past (before 500 CE) is the hardest era to
  // fill, so when it is empty we surface a gentle nudge toward it.
  const ancientCount =
    groups.find((group) => group.id === "ancient")?.records.length ?? 0;

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-28 pt-10 sm:pb-10">
        <AppHeader
          links={[
            { href: "/records", label: "Records" },
            { href: "/sparks", label: "Sparks" },
            { href: "/add", label: "Add" },
            { href: "/search", label: "Search" },
          ]}
        />

        <header className="mb-8">
          <h1 className="font-serif text-3xl font-medium text-obsidian">
            Timeline
          </h1>
          <p className="mt-1 text-sm text-stone-soft">
            {countLabel(records.length)} across history
          </p>
        </header>

        {/* Knowledge density: a raised card with one bar segment per era (width
            by count, opacity by density) and a chronological axis beneath. */}
        <section
          aria-labelledby="density-heading"
          className="rounded-2xl border border-parchment-border bg-parchment-raised p-5"
        >
          <h2
            id="density-heading"
            className="text-sm font-medium text-stone-warm"
          >
            Your knowledge density
          </h2>

          <div className="mt-4 flex h-2.5 w-full items-stretch gap-1" aria-hidden>
            {eraSegments.map((group) => {
              const count = group.records.length;

              if (count === 0) {
                return (
                  <div
                    key={group.id}
                    title={`${group.label} · ${countLabel(count)}`}
                    className="rounded-full border border-dashed border-parchment-border bg-parchment"
                    style={{ flexGrow: 0, flexBasis: "1.5rem" }}
                  />
                );
              }

              const opacity = 0.3 + 0.7 * (count / maxCount);
              return (
                <div
                  key={group.id}
                  title={`${group.label} · ${countLabel(count)}`}
                  className="rounded-full bg-ember"
                  style={{ flexGrow: count, flexBasis: 0, opacity }}
                />
              );
            })}
          </div>

          {/* The axis names the eras the segments above represent, in the same
              left→right oldest-to-newest order as the bar. */}
          <div className="mt-2 flex text-xs text-stone-soft">
            {eraSegments.map((group) => (
              <span
                key={group.id}
                title={group.label}
                className="min-w-0 flex-1 truncate px-0.5 text-center first:pl-0 first:text-left last:pr-0 last:text-right"
              >
                {group.label}
              </span>
            ))}
          </div>
        </section>

        {ancientCount === 0 ? (
          <Link
            href="#era-ancient"
            className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-ember/40 bg-ember/10 px-5 py-4 text-sm text-stone-warm transition hover:border-ember/60"
          >
            <span className="font-medium text-obsidian">
              Terra incognita — almost nothing before 500 CE
            </span>
            <span className="shrink-0 font-medium text-ember">Explore →</span>
          </Link>
        ) : null}

        <div className="mt-10 flex flex-col gap-10">
          {listGroups.map((group) => {
            const headingId = `era-${group.id}-heading`;
            const count = group.records.length;
            const isUndated = group.id === "undated";

            return (
              <section
                key={group.id}
                id={`era-${group.id}`}
                aria-labelledby={headingId}
                className="scroll-mt-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <h2
                    id={headingId}
                    className="text-xs font-medium uppercase tracking-[0.18em] text-stone-soft"
                  >
                    {group.label}
                    {group.rangeLabel ? ` · ${group.rangeLabel}` : ""}
                  </h2>
                  <span className="h-px flex-1 bg-parchment-border" aria-hidden />
                  <span className="text-xs text-stone-soft">
                    {countLabel(count)}
                  </span>
                </div>

                {count === 0 ? (
                  <Link
                    href="/add"
                    aria-label={`Add a record in the ${group.label} era`}
                    className="flex items-center justify-between rounded-xl border border-dashed border-parchment-border bg-parchment/60 px-5 py-5 text-stone-soft transition hover:border-ember/60 hover:text-obsidian"
                  >
                    <span className="text-sm">
                      Almost nothing here — terra incognita
                    </span>
                    <span
                      aria-hidden
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-parchment-border text-stone-warm"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </Link>
                ) : isUndated ? (
                  // No chronological position to express, so no year rail.
                  <UndatedMarkers records={group.records} />
                ) : (
                  <EraRail records={group.records} />
                )}
              </section>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
