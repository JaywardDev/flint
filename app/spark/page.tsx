import { requireUser } from "@/lib/auth/server";
import { listFlintRecordsByYear } from "@/lib/flint-records";
import type { FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

import { SparkPage } from "./SparkPage";

export default async function SparkRoute() {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const records = await listFlintRecordsByYear(recordsClient, user.id);

  return <SparkPage records={records} />;
}
