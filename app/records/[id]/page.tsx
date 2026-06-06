import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/server";
import { getFlintRecord, FLINT_RECORD_TYPE_LABELS } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function DetailPage({ params }: DetailPageProps) {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const { id } = await params;
  const record = await getFlintRecord(recordsClient, user.id, id);

  if (!record) {
    notFound();
  }

  const whenWhere = [record.when, record.where]
    .reduce<string[]>((values, value) => {
      if (value) values.push(value);
      return values;
    }, [])
    .join(" · ");

  const wasEdited = record.updated_at !== record.created_at;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <header className="mb-8">
        <Link
          href="/records"
          className="text-sm font-medium text-stone-warm transition hover:text-obsidian"
        >
          Back to records
        </Link>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
          {FLINT_RECORD_TYPE_LABELS[record.type]}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-obsidian">
          {record.title}
        </h1>
        {whenWhere ? (
          <p className="mt-4 text-sm text-stone-warm">{whenWhere}</p>
        ) : null}
      </header>

      {record.summary ? (
        <div className="border-t border-parchment-border pt-8">
          <p className="whitespace-pre-line font-serif text-lg leading-8 text-obsidian">
            {record.summary}
          </p>
        </div>
      ) : null}

      <p className="mt-12 text-xs text-stone-soft">
        Added {formatDate(record.created_at)}
        {wasEdited ? ` · Updated ${formatDate(record.updated_at)}` : ""}
      </p>
    </main>
  );
}
