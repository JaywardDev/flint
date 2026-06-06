export type FlintRecordType =
  | "person"
  | "event"
  | "place"
  | "object"
  | "note";

export const FLINT_RECORD_TYPES: FlintRecordType[] = [
  "person",
  "event",
  "place",
  "object",
  "note",
];

export interface FlintRecord {
  id: string;
  user_id: string;
  type: FlintRecordType;
  title: string;
  summary: string | null;
  when: string | null;
  where: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFlintRecordInput {
  type: FlintRecordType;
  title: string;
  summary?: string | null;
  when?: string | null;
  where?: string | null;
}

export type UpdateFlintRecordInput = Partial<CreateFlintRecordInput>;
