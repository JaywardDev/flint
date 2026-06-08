import { requireUser } from "@/lib/auth/server";
import { searchFlintRecords } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";
import { RecordList } from "../record-list";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function searchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const queryValue = searchValue(params.q);
  const trimmedQuery = queryValue.trim();
  const hasQuery = trimmedQuery.length > 0;

  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const records = hasQuery
    ? await searchFlintRecords(recordsClient, user.id, trimmedQuery)
    : [];

  return (
    <>
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-28 pt-10 sm:pb-10">
      <AppHeader
        links={[
          { href: "/records", label: "Records" },
          { href: "/timeline", label: "Timeline" },
          { href: "/sparks", label: "Sparks" },
          { href: "/add", label: "Add" },
        ]}
      />

      <section aria-labelledby="search-heading">
        <h1 id="search-heading" className="font-serif text-3xl text-obsidian">
          Search records
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-warm">
          Search words, places, types, or years.
        </p>

        <form className="mt-6" role="search">
          <label htmlFor="q" className="sr-only">
            Search records
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={queryValue}
            placeholder="Find a record"
            className="w-full rounded-xl border border-parchment-border bg-parchment-raised px-4 py-3 text-base text-obsidian outline-none transition placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
          />
        </form>
      </section>

      <section className="mt-8" aria-labelledby="results-heading">
        <div className="mb-5 flex items-center gap-4">
          <h2
            id="results-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-stone-soft"
          >
            Results
          </h2>
          <span className="h-px flex-1 bg-parchment-border" aria-hidden />
        </div>

        {!hasQuery ? (
          <p className="rounded-xl border border-parchment-border bg-parchment-raised px-5 py-8 text-center text-stone-warm">
            Search words, places, types, or years.
          </p>
        ) : records.length > 0 ? (
          <RecordList records={records} labelledBy="results-heading" />
        ) : (
          <p className="rounded-xl border border-parchment-border bg-parchment-raised px-5 py-8 text-center text-stone-warm">
            No records found for “{trimmedQuery}”.
          </p>
        )}
      </section>
    </main>
    <BottomNav />
    </>
  );
}
