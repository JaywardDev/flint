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

export const FLINT_RECORD_TYPE_LABELS: Record<FlintRecordType, string> = {
  person: "Person",
  event: "Event",
  place: "Place",
  object: "Object",
  note: "Note",
};

/**
 * Subtle per-type dot colours. Palette tokens only (see app/globals.css):
 * ember for Person, then progressively quieter neutrals so the dot reads as a
 * gentle hint rather than a category system competing with the title.
 */
export const RECORD_TYPE_DOT: Record<FlintRecordType, string> = {
  person: "bg-ember",
  event: "bg-obsidian",
  place: "bg-stone-warm",
  object: "bg-stone-soft",
  note: "bg-parchment-border",
};

export interface FlintRecord {
  id: string;
  user_id: string;
  type: FlintRecordType;
  title: string;
  summary: string | null;
  when: string | null;
  start_year: number | null;
  end_year: number | null;
  where: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFlintRecordInput {
  type: FlintRecordType;
  title: string;
  summary?: string | null;
  when?: string | null;
  start_year?: number | null;
  end_year?: number | null;
  where?: string | null;
}

export type UpdateFlintRecordInput = Partial<CreateFlintRecordInput>;
