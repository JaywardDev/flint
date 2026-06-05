export const FLINT_RECORD_TYPES = [
  "person",
  "event",
  "place",
  "object",
  "note",
] as const;

export type FlintRecordType = (typeof FLINT_RECORD_TYPES)[number];

export const FLINT_WHEN_PRECISIONS = [
  "exact",
  "approximate",
  "range",
  "era",
  "unknown",
] as const;

export type FlintWhenPrecision = (typeof FLINT_WHEN_PRECISIONS)[number];

export interface FlintRecord {
  id: string;
  user_id: string;
  raw_text: string;
  title: string | null;
  summary: string | null;
  why_it_matters: string | null;
  record_type: FlintRecordType | null;
  when_text: string | null;
  when_start: string | null;
  when_end: string | null;
  when_precision: FlintWhenPrecision | null;
  where_text: string | null;
  latitude: number | null;
  longitude: number | null;
  source_text: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateFlintRecordInput {
  raw_text: string;
  title?: string | null;
  summary?: string | null;
  why_it_matters?: string | null;
  record_type?: FlintRecordType | null;
  when_text?: string | null;
  when_start?: string | null;
  when_end?: string | null;
  when_precision?: FlintWhenPrecision | null;
  where_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  source_text?: string | null;
  tags?: string[];
}

export type UpdateFlintRecordInput = Partial<CreateFlintRecordInput>;
