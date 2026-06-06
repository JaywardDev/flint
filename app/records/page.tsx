import { requireUser } from "@/lib/auth/server";
import { listFlintRecords } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";
import { RecordList } from "../record-list";

export default async function RecordsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const records = await listFlintRecords(recordsClient, user.id);

  return (
    <>
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-28 pt-10 sm:pb-10">
      <AppHeader
        links={[
          { href: "/add", label: "Add" },
          { href: "/search", label: "Search" },
        ]}
      />

      <section aria-labelledby="records-heading">
        <div className="mb-5 flex items-center gap-4">
          <h1
            id="records-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-stone-soft"
          >
            Recent records
          </h1>
          <span className="h-px flex-1 bg-parchment-border" aria-hidden />
        </div>

        {records.length > 0 ? (
          <RecordList
            records={records}
            labelledBy="records-heading"
            showActions
          />
        ) : (
          <div className="rounded-xl border border-parchment-border bg-parchment-raised px-5 py-8 text-center">
            <p className="font-serif text-2xl text-obsidian">No records yet.</p>
            <p className="mt-2 text-sm text-stone-warm">
              Add one small thing you want to remember.
            </p>
          </div>
        )}
      </section>
    </main>
    <BottomNav />
    </>
  );
}
