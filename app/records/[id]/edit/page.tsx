import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/server";
import {
  FLINT_RECORD_TYPE_LABELS,
  FLINT_RECORD_TYPES,
  getFlintRecord,
} from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { RecordEditSubmitButton } from "../../../record-edit-submit-button";
import { updateRecordAction } from "../../../record-actions";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPage({ params }: EditPageProps) {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const { id } = await params;
  const record = await getFlintRecord(recordsClient, user.id, id);

  if (!record) {
    notFound();
  }

  const formAction = updateRecordAction.bind(null, record.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <header className="mb-8">
        <Link
          href={`/records/${record.id}`}
          className="text-sm font-medium text-stone-warm transition hover:text-obsidian"
        >
          Back to record
        </Link>
        <h1 className="mt-8 font-serif text-4xl leading-tight text-obsidian">
          Edit record
        </h1>
      </header>

      <form
        action={formAction}
        className="rounded-2xl border border-parchment-border bg-parchment-raised p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      >
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
          Type
          <select
            name="type"
            defaultValue={record.type}
            className="mt-2 w-full rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base normal-case tracking-normal text-obsidian outline-none transition focus:border-ember focus:ring-1 focus:ring-ember"
          >
            {FLINT_RECORD_TYPES.map((recordType) => (
              <option key={recordType} value={recordType}>
                {FLINT_RECORD_TYPE_LABELS[recordType]}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
          Title
          <input
            name="title"
            required
            autoComplete="off"
            defaultValue={record.title}
            className="mt-2 w-full border-none bg-transparent font-serif text-2xl leading-snug normal-case tracking-normal text-obsidian outline-none placeholder:text-stone-soft"
          />
        </label>

        <label className="mt-5 block text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
          Summary
          <textarea
            name="summary"
            rows={5}
            autoComplete="off"
            defaultValue={record.summary ?? ""}
            className="mt-2 w-full resize-none rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base leading-7 normal-case tracking-normal text-obsidian outline-none placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
          />
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
            When
            <input
              name="when"
              autoComplete="off"
              defaultValue={record.when ?? ""}
              className="mt-2 w-full rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base normal-case tracking-normal text-obsidian outline-none placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
            Where
            <input
              name="where"
              autoComplete="off"
              defaultValue={record.where ?? ""}
              className="mt-2 w-full rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base normal-case tracking-normal text-obsidian outline-none placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <Link
            href={`/records/${record.id}`}
            className="text-sm font-medium text-stone-warm transition hover:text-obsidian"
          >
            Back to record
          </Link>
          <RecordEditSubmitButton />
        </div>
      </form>
    </main>
  );
}
