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
  order(column: string, options: { ascending: boolean }): FlintRecordsRequest;
  select(columns?: string): FlintRecordsRequest;
  single(): PromiseLike<FlintSupabaseResult>;
}

interface FlintRecordsQuery {
  delete(): FlintRecordsRequest;
  insert(values: CreateFlintRecordInput & { user_id: string }): FlintRecordsRequest;
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
  userId: string,
  input: CreateFlintRecordInput,
): Promise<FlintRecord> {
  const { data, error } = await supabase
    .from("records")
    .insert({ ...input, user_id: userId })
    .select(RECORD_COLUMNS)
    .single();

  if (error) throw error;
  return data as FlintRecord;
}

export async function updateFlintRecord(
  supabase: FlintSupabaseClient,
  userId: string,
  id: string,
  input: UpdateFlintRecordInput,
): Promise<FlintRecord> {
  const { data, error } = await supabase
    .from("records")
    .update(input)
    .eq("user_id", userId)
    .eq("id", id)
    .select(RECORD_COLUMNS)
    .single();

  if (error) throw error;
  return data as FlintRecord;
}

export async function deleteFlintRecord(
  supabase: FlintSupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("records")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw error;
}

export async function getFlintRecord(
  supabase: FlintSupabaseClient,
  userId: string,
  id: string,
): Promise<FlintRecord | null> {
  const { data, error } = await supabase
    .from("records")
    .select(RECORD_COLUMNS)
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "PGRST116") return null;
    throw error;
  }

  return data as FlintRecord;
}

export async function listFlintRecords(
  supabase: FlintSupabaseClient,
  userId: string,
): Promise<FlintRecord[]> {
  const { data, error } = await supabase
    .from("records")
    .select(RECORD_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as FlintRecord[];
}

export async function searchFlintRecords(
  supabase: FlintSupabaseClient,
  userId: string,
  searchQuery: string,
): Promise<FlintRecord[]> {
  const trimmedQuery = searchQuery.trim();

  if (!trimmedQuery) {
    return listFlintRecords(supabase, userId);
  }

  const term = escapeSearchTerm(trimmedQuery);
  const { data, error } = await supabase
    .from("records")
    .select(RECORD_COLUMNS)
    .eq("user_id", userId)
    .or(
      `title.ilike.%${term}%,summary.ilike.%${term}%,when.ilike.%${term}%,where.ilike.%${term}%,type.ilike.%${term}%`,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as FlintRecord[];
}
