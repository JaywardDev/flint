import Link from "next/link";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

const emptyRecord = {
  type: "note",
  title: "Record not loaded",
  summary: "Saved record details will appear here when data access is connected.",
  when: null,
  where: null,
  created_at: "—",
  updated_at: "—",
};

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <header className="mb-10">
        <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-950">
          Back to records
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          {emptyRecord.type}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          {emptyRecord.title}
        </h1>
      </header>

      <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-6">
          <div>
            <dt className="text-sm font-medium text-stone-500">Summary</dt>
            <dd className="mt-2 text-lg leading-8 text-stone-950">
              {emptyRecord.summary}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">When</dt>
            <dd className="mt-2 text-stone-950">{emptyRecord.when ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Where</dt>
            <dd className="mt-2 text-stone-950">{emptyRecord.where ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Created</dt>
            <dd className="mt-2 text-stone-950">{emptyRecord.created_at}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Updated</dt>
            <dd className="mt-2 text-stone-950">{emptyRecord.updated_at}</dd>
          </div>
        </dl>
      </article>

      <p className="mt-6 text-xs text-stone-400">Record id: {id}</p>
    </main>
  );
}
