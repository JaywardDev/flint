import type { FlintRecord } from "./types";

/**
 * Static era table for the Timeline view. Eras are derived from start_year in
 * plain TS — there is no era column in the database. Bounds are inclusive
 * internal timeline years, where BCE years use astronomical numbering
 * (1 BCE = 0, 2 BCE = -1). Anything before 500 CE is lumped into a loose
 * "Ancient world" bucket.
 */
export interface FlintEra {
  id: string;
  label: string;
  rangeLabel: string;
  /** Inclusive lower bound, in internal timeline years. */
  min: number;
  /** Inclusive upper bound, in internal timeline years. */
  max: number;
}

export const FLINT_ERAS: readonly FlintEra[] = [
  {
    id: "ancient",
    label: "Ancient world",
    rangeLabel: "before 500",
    min: -Infinity,
    max: 499,
  },
  {
    id: "medieval",
    label: "Medieval",
    rangeLabel: "500–1399",
    min: 500,
    max: 1399,
  },
  {
    id: "early-modern",
    label: "Early Modern",
    rangeLabel: "1400–1699",
    min: 1400,
    max: 1699,
  },
  {
    id: "modern",
    label: "Modern",
    rangeLabel: "1700–1899",
    min: 1700,
    max: 1899,
  },
  {
    id: "contemporary",
    label: "Contemporary",
    rangeLabel: "1900–present",
    min: 1900,
    max: Infinity,
  },
];

export type FlintEraId = (typeof FLINT_ERAS)[number]["id"] | "undated";

export function formatFlintTimelineYear(year: number): string {
  if (year <= 0) return `${1 - year} BCE`;
  return String(year);
}

export function getFlintTimelineDateLabel(record: FlintRecord): string {
  const when = record.when?.trim();
  if (when) return when;

  if (record.start_year == null) return "—";
  return formatFlintTimelineYear(record.start_year);
}

/**
 * Sort records for the Timeline lens: parsed numeric years newest-to-oldest,
 * unparseable records last by newest created_at fallback.
 */
export function compareFlintRecordsForTimeline(a: FlintRecord, b: FlintRecord) {
  if (a.start_year == null && b.start_year != null) return 1;
  if (a.start_year != null && b.start_year == null) return -1;

  if (a.start_year != null && b.start_year != null) {
    const startDifference = b.start_year - a.start_year;
    if (startDifference !== 0) return startDifference;

    const aEndYear = a.end_year ?? a.start_year;
    const bEndYear = b.end_year ?? b.start_year;
    const endDifference = bEndYear - aEndYear;
    if (endDifference !== 0) return endDifference;
  }

  const createdDifference = b.created_at.localeCompare(a.created_at);
  if (createdDifference !== 0) return createdDifference;

  return a.id.localeCompare(b.id);
}

export function sortFlintRecordsForTimeline(
  records: readonly FlintRecord[],
): FlintRecord[] {
  return [...records].sort(compareFlintRecordsForTimeline);
}

export interface FlintEraGroup {
  id: FlintEraId;
  label: string;
  /** null for the Undated group, which has no year range. */
  rangeLabel: string | null;
  records: FlintRecord[];
}

/**
 * Group records into the static eras by start_year. The five eras are always
 * returned in chronological order (empty eras included, so the density bar can
 * render oldest-to-newest). Records with a null start_year fall into a trailing
 * "Undated" group, which is only included when it has records.
 *
 * Records are bucketed by start_year only; input order is preserved within each
 * group after the shared timeline sorter has established canonical
 * newest-to-oldest record order.
 */
export function groupFlintRecordsByEra(
  records: readonly FlintRecord[],
): FlintEraGroup[] {
  const groups: FlintEraGroup[] = FLINT_ERAS.map((era) => ({
    id: era.id,
    label: era.label,
    rangeLabel: era.rangeLabel,
    records: [],
  }));
  const undated: FlintRecord[] = [];

  for (const record of records) {
    const year = record.start_year;
    if (year == null) {
      undated.push(record);
      continue;
    }

    const eraIndex = FLINT_ERAS.findIndex(
      (era) => year >= era.min && year <= era.max,
    );
    if (eraIndex === -1) {
      undated.push(record);
    } else {
      groups[eraIndex].records.push(record);
    }
  }

  if (undated.length > 0) {
    groups.push({
      id: "undated",
      label: "Undated",
      rangeLabel: null,
      records: undated,
    });
  }

  return groups;
}
