import type {
  CreateFlintRecordInput,
  FlintRecord,
  UpdateFlintRecordInput,
} from "./types";

interface FlintSupabaseResult {
  data: unknown;
  error: unknown;
}

interface FlintRecordsRequest extends PromiseLike<FlintSupabaseResult> {
  eq(column: string, value: string): FlintRecordsRequest;
  or(query: string): FlintRecordsRequest;
  order(
    column: string,
    options: { ascending: boolean },
  ): FlintRecordsRequest;
  select(columns?: string): FlintRecordsRequest;
  single(): PromiseLike<FlintSupabaseResult>;
}

interface FlintRecordsQuery {
  delete(): FlintRecordsRequest;
  insert(values: CreateFlintRecordInput): FlintRecordsRequest;
  select(columns?: string): FlintRecordsRequest;
  update(values: UpdateFlintRecordInput): FlintRecordsRequest;
}

/**
 * The small subset of a Supabase client used by the record helpers.
 * A browser or server SupabaseClient can be passed directly.
 */
export interface FlintSupabaseClient {
  from(relation: "records"): FlintRecordsQuery;
}

const RECORD_COLUMNS =
  "id,user_id,type,title,summary,when,where,created_at,updated_at";

function escapeSearchTerm(searchQuery: string): string {
  return searchQuery.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export async function createFlintRecord(
  supabase: FlintSupabaseClient,
  input: CreateFlintRecordInput,
): Promise<FlintRecord> {
  const { data, error } = await supabase
    .from("records")
    .insert(input)
    .select(RECORD_COLUMNS)
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
    .select(RECORD_COLUMNS)
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
    .select(RECORD_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as FlintRecord[];
}

export async function searchFlintRecords(
  supabase: FlintSupabaseClient,
  searchQuery: string,
): Promise<FlintRecord[]> {
  const trimmedQuery = searchQuery.trim();

  if (!trimmedQuery) {
    return listFlintRecords(supabase);
  }

  const term = escapeSearchTerm(trimmedQuery);
  const { data, error } = await supabase
    .from("records")
    .select(RECORD_COLUMNS)
    .or(
      `title.ilike.%${term}%,summary.ilike.%${term}%,when.ilike.%${term}%,where.ilike.%${term}%,type.ilike.%${term}%`,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as FlintRecord[];
}
