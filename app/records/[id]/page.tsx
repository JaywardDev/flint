import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/server";
import { getFlintRecord } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <header className="mb-10">
        <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-950">
          Back to records
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          {record.type}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          {record.title}
        </h1>
      </header>

      <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-6">
          <div>
            <dt className="text-sm font-medium text-stone-500">Summary</dt>
            <dd className="mt-2 text-lg leading-8 text-stone-950">
              {record.summary ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">When</dt>
            <dd className="mt-2 text-stone-950">{record.when ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Where</dt>
            <dd className="mt-2 text-stone-950">{record.where ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Created</dt>
            <dd className="mt-2 text-stone-950">{formatDate(record.created_at)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Updated</dt>
            <dd className="mt-2 text-stone-950">{formatDate(record.updated_at)}</dd>
          </div>
        </dl>
      </article>

      <p className="mt-6 text-xs text-stone-400">Record id: {id}</p>
    </main>
  );
}
