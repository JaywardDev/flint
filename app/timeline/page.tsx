import Link from "next/link";

import { requireUser } from "@/lib/auth/server";
import {
  FLINT_RECORD_TYPE_LABELS,
  RECORD_TYPE_DOT,
  groupFlintRecordsByEra,
  listFlintRecordsByYear,
} from "@/lib/flint-records";
import type { FlintRecord, FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";

function countLabel(count: number) {
  return `${count} ${count === 1 ? "record" : "records"}`;
}

// Shared card for both the year-rail rows and the Undated section. The type
// dot is optional: in the year rail the centre rail already signals type, so
// the badge drops its leading dot; in the Undated section there is no rail, so
// the dot stays as the only type cue.
function RecordCard({
  record,
  className = "",
  withTypeDot = false,
}: {
  record: FlintRecord;
  className?: string;
  withTypeDot?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border border-parchment-border bg-parchment-raised transition hover:border-ember/60 ${className}`}
    >
      <Link href={`/records/${record.id}`} className="block p-5">
        <h3 className="font-serif text-xl font-medium text-obsidian">
          {record.title}
        </h3>
        {record.where ? (
          <p className="mt-1 text-sm text-stone-soft">{record.where}</p>
        ) : null}
        <p className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
          {withTypeDot ? (
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${RECORD_TYPE_DOT[record.type]}`}
            />
          ) : null}
          {FLINT_RECORD_TYPE_LABELS[record.type]}
        </p>
      </Link>
    </article>
  );
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
            const isUndated = group.id === "undated";

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

                {count === 0 ? (
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
                ) : isUndated ? (
                  // No chronological position to express, so no year rail.
                  <div className="flex flex-col gap-3" aria-labelledby={headingId}>
                    {group.records.map((record) => (
                      <RecordCard key={record.id} record={record} withTypeDot />
                    ))}
                  </div>
                ) : (
                  <ol className="flex flex-col" aria-labelledby={headingId}>
                    {group.records.map((record, index) => {
                      const isFirst = index === 0;
                      const isLast = index === group.records.length - 1;
                      const yearLabel =
                        record.start_year == null
                          ? "—"
                          : String(record.start_year);

                      return (
                        <li key={record.id} className="flex gap-3">
                          {/* Year column: start year only, muted. */}
                          <div className="w-12 shrink-0 pt-6 text-right text-xs tabular-nums text-stone-soft">
                            {yearLabel}
                          </div>

                          {/* Centre rail: line above + dot + line below. The
                              above/below split keeps the connector continuous
                              through the dot's offset and the gap between cards,
                              while leaving no line above the first dot or below
                              the last. */}
                          <div className="flex w-4 shrink-0 flex-col items-center">
                            <span
                              aria-hidden
                              className={`h-6 w-[1.5px] ${
                                isFirst ? "" : "bg-parchment-border"
                              }`}
                            />
                            <span
                              aria-hidden
                              className={`h-2 w-2 shrink-0 rounded-full ${RECORD_TYPE_DOT[record.type]}`}
                            />
                            {!isLast ? (
                              <span
                                aria-hidden
                                className="w-[1.5px] flex-1 bg-parchment-border"
                              />
                            ) : null}
                          </div>

                          <RecordCard
                            record={record}
                            className={`flex-1 ${isLast ? "" : "mb-4"}`}
                          />
                        </li>
                      );
                    })}
                  </ol>
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
