import Link from "next/link";

import { requireUser } from "@/lib/auth/server";
import { searchFlintRecords } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { SignOutButton } from "./sign-out-button";

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
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
              Flint
            </p>
            <SignOutButton />
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
            Records
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-stone-600">
            A simple notebook of people, events, places, objects, and notes.
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Add record
        </Link>
      </header>

      <form className="mb-6" role="search">
        <label htmlFor="q" className="sr-only">
          Search records
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={queryValue}
          placeholder="Search records"
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
        />
      </form>

      <section className="flex flex-col gap-3" aria-label="Records">
        {visibleRecords.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-stone-950">
              No records yet
            </h2>
            <p className="mt-3 text-stone-600">
              Add the first record when something is worth remembering.
            </p>
            <Link
              href="/add"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:border-stone-500"
            >
              Open Add
            </Link>
          </div>
        ) : (
          visibleRecords.reduce<React.ReactNode[]>((items, record) => {
            items.push(
              <Link
                key={record.id}
                href={`/records/${record.id}`}
                className="rounded-3xl border border-stone-200 bg-white p-5 transition hover:border-stone-400"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {record.type}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                  {record.title}
                </h2>
                {record.summary ? (
                  <p className="mt-3 line-clamp-2 text-stone-600">
                    {record.summary}
                  </p>
                ) : null}
                {record.when || record.where ? (
                  <p className="mt-4 text-sm text-stone-500">
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
