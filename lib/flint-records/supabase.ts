import type {
  CreateFlintRecordInput,
  FlintRecord,
  UpdateFlintRecordInput,
} from "./types";

interface FlintSupabaseResult {
  data: unknown;
  error: unknown;
}

interface FlintRecordsFilterQuery extends PromiseLike<FlintSupabaseResult> {
  eq(column: string, value: string): FlintRecordsFilterQuery;
  order(
    column: string,
    options: { ascending: boolean },
  ): FlintRecordsFilterQuery;
  select(columns?: string): FlintRecordsFilterQuery;
  single(): PromiseLike<FlintSupabaseResult>;
}

interface FlintRecordsQuery {
  delete(): FlintRecordsFilterQuery;
  insert(values: CreateFlintRecordInput): FlintRecordsFilterQuery;
  select(columns?: string): FlintRecordsFilterQuery;
  update(values: UpdateFlintRecordInput): FlintRecordsFilterQuery;
}

/**
 * The small subset of a Supabase client used by the record helpers.
 * A browser or server SupabaseClient can be passed directly.
 */
export interface FlintSupabaseClient {
  from(relation: "records"): FlintRecordsQuery;
  rpc(
    fn: "search_records",
    args: { search_query: string },
  ): PromiseLike<FlintSupabaseResult>;
}

export async function createFlintRecord(
  supabase: FlintSupabaseClient,
  input: CreateFlintRecordInput,
): Promise<FlintRecord> {
  const { data, error } = await supabase
    .from("records")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as FlintRecord;
}

export async function updateFlintRecord(
  supabase: FlintSupabaseClient,
  id: string,
  input: UpdateFlintRecordInput,
): Promise<FlintRecord> {
  const { data, error } = await supabase
    .from("records")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FlintRecord;
}

export async function deleteFlintRecord(
  supabase: FlintSupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("records").delete().eq("id", id);

  if (error) throw error;
}

export async function listFlintRecords(
  supabase: FlintSupabaseClient,
): Promise<FlintRecord[]> {
  const { data, error } = await supabase
    .from("records")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as FlintRecord[];
}

export async function searchFlintRecords(
  supabase: FlintSupabaseClient,
  searchQuery: string,
): Promise<FlintRecord[]> {
  const { data, error } = await supabase.rpc("search_records", {
    search_query: searchQuery,
  });

  if (error) throw error;
  return data as FlintRecord[];
}
