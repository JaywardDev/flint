import Link from "next/link";

import { requireUser } from "@/lib/auth/server";
import { groupFlintRecordsByEra, listFlintRecordsByYear } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";
import { RecordList } from "../record-list";

function countLabel(count: number) {
  return `${count} ${count === 1 ? "record" : "records"}`;
}

export default async function TimelinePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const records = await listFlintRecordsByYear(recordsClient, user.id);
  const groups = groupFlintRecordsByEra(records);

  // The density bar spans history, so it excludes the Undated catch-all.
  const eraSegments = groups.filter((group) => group.id !== "undated");
  const maxCount = Math.max(1, ...eraSegments.map((group) => group.records.length));

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

        <section aria-labelledby="timeline-heading">
          <div className="mb-5 flex items-center gap-4">
            <h1
              id="timeline-heading"
              className="text-xs font-medium uppercase tracking-[0.18em] text-stone-soft"
            >
              Timeline
            </h1>
            <span className="h-px flex-1 bg-parchment-border" aria-hidden />
          </div>

          {/* Density bar: one segment per era, width by count, opacity by density. */}
          <div className="flex h-2.5 w-full items-stretch gap-1" aria-hidden>
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
        </section>

        <div className="mt-10 flex flex-col gap-10">
          {groups.map((group) => {
            const headingId = `era-${group.id}-heading`;
            const count = group.records.length;

            return (
              <section key={group.id} aria-labelledby={headingId}>
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 id={headingId} className="font-serif text-xl text-obsidian">
                    {group.label}
                    {group.rangeLabel ? (
                      <span className="text-stone-soft"> · {group.rangeLabel}</span>
                    ) : null}
                  </h2>
                  <span className="text-xs text-stone-soft">{countLabel(count)}</span>
                </div>

                {count > 0 ? (
                  <RecordList records={group.records} labelledBy={headingId} />
                ) : (
                  <Link
                    href="/add"
                    aria-label={`Add a record in the ${group.label} era`}
                    className="flex items-center justify-between rounded-xl border border-dashed border-parchment-border bg-parchment px-5 py-6 text-stone-warm transition hover:border-ember/60 hover:text-obsidian"
                  >
                    <span className="text-sm">Nothing here yet</span>
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
