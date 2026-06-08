import { requireUser } from "@/lib/auth/server";
import { listFlintRecords } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";
import { CaptureBox } from "./capture-box";
import { ExampleList } from "./example-list";
import { RecordList } from "./record-list";

export default async function HomePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const records = await listFlintRecords(recordsClient, user.id);
  const hasRecords = records.length > 0;

  return (
    <>
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pb-28 pt-10 sm:pb-10">
      <AppHeader
        links={[
          { href: "/records", label: "Records" },
          { href: "/timeline", label: "Timeline" },
          { href: "/spark", label: "Spark" },
          { href: "/sparks", label: "Sparks" },
          { href: "/search", label: "Search" },
        ]}
      />

      <CaptureBox />

      <section className="mt-10" aria-labelledby="home-records-heading">
        <div className="mb-5 flex items-center gap-4">
          <h2
            id="home-records-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-stone-soft"
          >
            {hasRecords ? "Recent records" : "A few examples"}
          </h2>
          <span className="h-px flex-1 bg-parchment-border" aria-hidden />
        </div>

        {hasRecords ? (
          <RecordList records={records} labelledBy="home-records-heading" />
        ) : (
          <ExampleList />
        )}
      </section>
    </main>
    <BottomNav />
    </>
  );
}
