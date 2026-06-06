import Link from "next/link";

import { requireUser } from "@/lib/auth/server";
import { searchFlintRecords, FLINT_RECORD_TYPE_LABELS } from "@/lib/flint-records";
import type { FlintRecord, FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { CaptureBox } from "./capture-box";
import { EXAMPLE_RECORDS } from "./example-records";
import { SignOutButton } from "./sign-out-button";
import { Wordmark } from "./wordmark";

type ListPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function metaLine(when: string | null | undefined, where: string | null | undefined) {
  return [when, where]
    .reduce<string[]>((parts, value) => {
      if (value) parts.push(value);
      return parts;
    }, [])
    .join(" · ");
}

export default async function HomePage({ searchParams }: ListPageProps) {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const params = await searchParams;
  const queryValue = params.q ?? "";
  const hasQuery = queryValue.trim().length > 0;
  const records = await searchFlintRecords(recordsClient, user.id, queryValue);

  const showExamples = records.length === 0 && !hasQuery;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Wordmark className="text-sm" />
        <SignOutButton />
      </header>

      <CaptureBox />

      <form className="mt-8" role="search">
        <label htmlFor="q" className="sr-only">
          Search records
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={queryValue}
          placeholder="Search records"
          className="w-full rounded-xl border border-parchment-border bg-parchment-raised px-4 py-2.5 text-sm text-obsidian outline-none transition placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
        />
      </form>

      <section className="mt-8 flex flex-col gap-3" aria-label="Records">
        <div className="mb-1 flex items-center gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-soft">
            {hasQuery ? "Results" : "Recent"}
          </p>
          <span className="h-px flex-1 bg-parchment-border" aria-hidden />
        </div>

        {records.length > 0 ? (
          records.reduce<React.ReactNode[]>((items, record) => {
            items.push(<RecordCard key={record.id} record={record} />);
            return items;
          }, [])
        ) : showExamples ? (
          <>
            <p className="mb-1 text-sm text-stone-warm">
              A few examples to show the shape of a record. Add your own above —
              these fade once you do.
            </p>
            {EXAMPLE_RECORDS.reduce<React.ReactNode[]>((items, record, index) => {
              items.push(<ExampleCard key={index} record={record} />);
              return items;
            }, [])}
          </>
        ) : (
          <p className="rounded-xl border border-parchment-border bg-parchment-raised px-5 py-8 text-center text-stone-warm">
            Nothing matches “{queryValue.trim()}”.
          </p>
        )}
      </section>
    </main>
  );
}

function RecordCard({ record }: { record: FlintRecord }) {
  const meta = metaLine(record.when, record.where);

  return (
    <Link
      href={`/records/${record.id}`}
      className="rounded-xl border border-parchment-border bg-parchment-raised p-5 transition hover:border-ember/60"
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
        {FLINT_RECORD_TYPE_LABELS[record.type]}
      </p>
      <h2 className="mt-2 font-serif text-xl text-obsidian">{record.title}</h2>
      {record.summary ? (
        <p className="mt-3 line-clamp-2 text-stone-warm">{record.summary}</p>
      ) : null}
      {meta ? <p className="mt-4 text-sm text-stone-soft">{meta}</p> : null}
    </Link>
  );
}

function ExampleCard({ record }: { record: (typeof EXAMPLE_RECORDS)[number] }) {
  const meta = metaLine(record.when, record.where);

  return (
    <div className="rounded-xl border border-dashed border-parchment-border bg-parchment-raised/60 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
          {FLINT_RECORD_TYPE_LABELS[record.type]}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs text-ember">
          <span className="inline-block h-1.5 w-1.5 rotate-45 bg-ember" aria-hidden />
          Example
        </span>
      </div>
      <h2 className="mt-2 font-serif text-xl text-obsidian">{record.title}</h2>
      <p className="mt-3 text-stone-warm">{record.summary}</p>
      {meta ? <p className="mt-4 text-sm text-stone-soft">{meta}</p> : null}
    </div>
  );
}
