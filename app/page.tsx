import Link from "next/link";

import { requireUser } from "@/lib/auth/server";
import { searchFlintRecords, FLINT_RECORD_TYPE_LABELS } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { SignOutButton } from "./sign-out-button";
import { Wordmark } from "./wordmark";

type ListPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ListPage({ searchParams }: ListPageProps) {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const params = await searchParams;
  const queryValue = params.q ?? "";
  const visibleRecords = await searchFlintRecords(recordsClient, user.id, queryValue);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <Wordmark className="text-sm" />
          <SignOutButton />
        </div>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-obsidian">Records</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-stone-warm">
              A quiet notebook of people, events, places, objects, and notes.
            </p>
          </div>
          <Link
            href="/add"
            className="inline-flex items-center justify-center rounded-full bg-obsidian px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-obsidian/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
          >
            Add record
          </Link>
        </div>
      </header>

      <form className="mb-8" role="search">
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

      <section className="flex flex-col gap-3" aria-label="Records">
        {visibleRecords.length === 0 ? (
          <div className="rounded-2xl border border-parchment-border bg-parchment-raised p-10 text-center">
            <h2 className="font-serif text-2xl text-obsidian">Nothing recorded yet</h2>
            <p className="mt-3 text-stone-warm">Add the first thing worth remembering.</p>
            <Link
              href="/add"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-obsidian px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-obsidian/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-raised"
            >
              Add your first record
            </Link>
          </div>
        ) : (
          visibleRecords.reduce<React.ReactNode[]>((items, record) => {
            items.push(
              <Link
                key={record.id}
                href={`/records/${record.id}`}
                className="rounded-xl border border-parchment-border bg-parchment-raised p-5 transition hover:border-ember/60"
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
                  {FLINT_RECORD_TYPE_LABELS[record.type]}
                </p>
                <h2 className="mt-2 font-serif text-xl text-obsidian">
                  {record.title}
                </h2>
                {record.summary ? (
                  <p className="mt-3 line-clamp-2 text-stone-warm">
                    {record.summary}
                  </p>
                ) : null}
                {record.when || record.where ? (
                  <p className="mt-4 text-sm text-stone-soft">
                    {[record.when, record.where]
                      .reduce<string[]>((values, value) => {
                        if (value) values.push(value);
                        return values;
                      }, [])
                      .join(" · ")}
                  </p>
                ) : null}
              </Link>,
            );
            return items;
          }, [])
        )}
      </section>
    </main>
  );
}
