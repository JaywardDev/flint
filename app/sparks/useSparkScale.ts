import type { FlintRecord, FlintRecordType } from "@/lib/flint-records";

/**
 * Pure scale + layout maths for the Spark Time Map. No React, no DOM, no data
 * fetching — just the segmented-compression mapping function, the four preset
 * zoom modes, the static era table, and the greedy lane-assignment algorithm
 * that turns records into collision-free SVG positions.
 *
 * The map deliberately compresses deep time: a flat linear axis would squash
 * five thousand years of history into a sliver and leave the modern era —
 * where most records live — unreadable. Each era instead gets a fixed fraction
 * of the available pixel width (its `weight`), so dense recent centuries get
 * room to breathe while the ancient world stays present but condensed.
 */

export type ScaleSegment = { start: number; end: number; weight: number };

export type SparkZoomModeId = "all" | "last-2000" | "last-500" | "last-100";

export interface SparkZoomMode {
  id: SparkZoomModeId;
  label: string;
  /** Inclusive visible lower bound (internal timeline years). */
  minYear: number;
  /** Inclusive visible upper bound (internal timeline years). */
  maxYear: number;
  segments: ScaleSegment[];
}

/**
 * The "now" anchor for the relative zoom presets. The map reads from existing
 * records only, so this is a display convenience rather than live data — kept
 * as a constant so the segment tables stay deterministic.
 */
export const SPARK_NOW_YEAR = 2026;

/**
 * Four preset zoom modes. Each carries its own segment array covering only its
 * visible range, with weights redistributed so the denser, more recent end of
 * each window gets proportionally more room.
 */
export const SPARK_ZOOM_MODES: SparkZoomMode[] = [
  {
    id: "all",
    label: "All history",
    minYear: -3000,
    maxYear: SPARK_NOW_YEAR,
    segments: [
      { start: -3000, end: 1, weight: 0.15 },
      { start: 1, end: 1500, weight: 0.2 },
      { start: 1500, end: 1800, weight: 0.2 },
      { start: 1800, end: 1950, weight: 0.25 },
      { start: 1950, end: SPARK_NOW_YEAR, weight: 0.2 },
    ],
  },
  {
    id: "last-2000",
    label: "Last 2000 yr",
    minYear: SPARK_NOW_YEAR - 2000,
    maxYear: SPARK_NOW_YEAR,
    segments: [
      { start: SPARK_NOW_YEAR - 2000, end: 1000, weight: 0.25 },
      { start: 1000, end: 1500, weight: 0.2 },
      { start: 1500, end: 1800, weight: 0.2 },
      { start: 1800, end: 1950, weight: 0.2 },
      { start: 1950, end: SPARK_NOW_YEAR, weight: 0.15 },
    ],
  },
  {
    id: "last-500",
    label: "Last 500 yr",
    minYear: SPARK_NOW_YEAR - 500,
    maxYear: SPARK_NOW_YEAR,
    segments: [
      { start: SPARK_NOW_YEAR - 500, end: 1700, weight: 0.25 },
      { start: 1700, end: 1850, weight: 0.25 },
      { start: 1850, end: 1950, weight: 0.25 },
      { start: 1950, end: SPARK_NOW_YEAR, weight: 0.25 },
    ],
  },
  {
    id: "last-100",
    label: "Last 100 yr",
    minYear: SPARK_NOW_YEAR - 100,
    maxYear: SPARK_NOW_YEAR,
    segments: [
      { start: SPARK_NOW_YEAR - 100, end: 1960, weight: 0.3 },
      { start: 1960, end: 1990, weight: 0.3 },
      { start: 1990, end: SPARK_NOW_YEAR, weight: 0.4 },
    ],
  },
];

export const DEFAULT_SPARK_ZOOM_MODE = SPARK_ZOOM_MODES[0];

export function getSparkZoomMode(id: SparkZoomModeId): SparkZoomMode {
  return SPARK_ZOOM_MODES.find((mode) => mode.id === id) ?? DEFAULT_SPARK_ZOOM_MODE;
}

/**
 * Map a timeline year to an x pixel offset within `width`, using the segmented
 * compression scale. Years before the first segment clamp to 0; years past the
 * last segment clamp to `width`. Weights are normalised so they need not sum to
 * exactly 1.
 */
export function yearToX(
  year: number,
  segments: ScaleSegment[],
  width: number,
): number {
  const totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0) || 1;
  let cursor = 0;

  for (const segment of segments) {
    const segmentWidth = (segment.weight / totalWeight) * width;

    if (year <= segment.start) return cursor;

    if (year >= segment.end) {
      cursor += segmentWidth;
      continue;
    }

    const span = segment.end - segment.start;
    const fraction = span === 0 ? 0 : (year - segment.start) / span;
    return cursor + fraction * segmentWidth;
  }

  return cursor;
}

/** Per-type fill colours, matching the dot palette used across the app. */
export const SPARK_TYPE_COLOR: Record<FlintRecordType, string> = {
  person: "#C79B45", // ember
  event: "#1A1A1D", // obsidian
  place: "#6B6761", // stone-warm
  object: "#8A857D", // stone-soft
  note: "#B8A898",
};

export interface SparkEra {
  id: string;
  label: string;
  /** Inclusive lower bound; -Infinity for the open-ended ancient bucket. */
  start: number;
  /** Exclusive upper bound; Infinity for the open-ended modern bucket. */
  end: number;
}

/**
 * Era bands for the map background. Bounds are open at the extremes so they
 * clamp cleanly to whatever the active zoom mode reveals.
 */
export const SPARK_ERAS: SparkEra[] = [
  { id: "ancient", label: "Ancient", start: -Infinity, end: 500 },
  { id: "medieval", label: "Medieval", start: 500, end: 1400 },
  { id: "early-modern", label: "Early Modern", start: 1400, end: 1800 },
  { id: "industrial", label: "Industrial", start: 1800, end: 1950 },
  { id: "modern", label: "Modern", start: 1950, end: Infinity },
];

export interface SparkEraBand extends SparkEra {
  /** Era bounds clamped to the visible window. */
  visibleStart: number;
  visibleEnd: number;
}

/**
 * The eras that fall within a zoom mode's visible range, each clamped to that
 * window. Eras with no overlap are dropped so we never draw a zero-width band.
 */
export function sparkErasInView(mode: SparkZoomMode): SparkEraBand[] {
  const bands: SparkEraBand[] = [];

  for (const era of SPARK_ERAS) {
    const visibleStart = Math.max(era.start, mode.minYear);
    const visibleEnd = Math.min(era.end, mode.maxYear);
    if (visibleEnd <= visibleStart) continue;
    bands.push({ ...era, visibleStart, visibleEnd });
  }

  return bands;
}

// Shape geometry, shared between layout maths and the SVG renderer so lane
// assignment reserves exactly the space a record will draw into.
export const SPARK_POINT_RADIUS = 6;
export const SPARK_BAR_HEIGHT = 10;
/** Smallest horizontal footprint any record may claim (point events). */
export const SPARK_MIN_EXTENT = 12;
/** Minimum horizontal breathing room between records sharing a lane. */
export const SPARK_LANE_GAP = 6;

export interface SparkLayoutItem {
  record: FlintRecord;
  id: string;
  type: FlintRecordType;
  title: string;
  isPoint: boolean;
  /** Lane index, 0 = topmost. */
  lane: number;
  /** Left and right pixel edges of the drawn shape. */
  x1: number;
  x2: number;
  /** Horizontal midpoint, where the leader line drops to the axis. */
  centerX: number;
}

export interface SparkLayout {
  items: SparkLayoutItem[];
  laneCount: number;
}

function isPointRecord(record: FlintRecord): boolean {
  if (record.end_year == null) return true;
  if (record.start_year == null) return false;
  return record.end_year - record.start_year < 3;
}

/**
 * Greedy left-to-right lane assignment. Records are processed by ascending
 * start year; each is dropped into the lowest lane whose last occupant ends at
 * least `SPARK_LANE_GAP` pixels before this record begins. Point events reserve
 * a minimum 12px footprint so their dots never collide.
 *
 * Records without a start year, or whose range lies entirely outside the active
 * window, are skipped — they have no place on this axis.
 */
export function buildSparkLayout(
  records: readonly FlintRecord[],
  mode: SparkZoomMode,
  width: number,
): SparkLayout {
  const visible = records
    .filter((record) => {
      if (record.start_year == null) return false;
      const end = record.end_year ?? record.start_year;
      return record.start_year <= mode.maxYear && end >= mode.minYear;
    })
    .sort((a, b) => {
      const startDiff = (a.start_year ?? 0) - (b.start_year ?? 0);
      if (startDiff !== 0) return startDiff;
      return (a.end_year ?? a.start_year ?? 0) - (b.end_year ?? b.start_year ?? 0);
    });

  // Rightmost reserved edge per lane; index is the lane number.
  const laneEdges: number[] = [];
  const items: SparkLayoutItem[] = [];

  for (const record of visible) {
    const startYear = record.start_year as number;
    const endYear = record.end_year ?? startYear;
    const point = isPointRecord(record);

    let x1: number;
    let x2: number;
    let centerX: number;

    if (point) {
      centerX = yearToX(startYear, mode.segments, width);
      x1 = centerX - SPARK_POINT_RADIUS;
      x2 = centerX + SPARK_POINT_RADIUS;
    } else {
      const rawX1 = yearToX(startYear, mode.segments, width);
      const rawX2 = yearToX(endYear, mode.segments, width);
      x1 = rawX1;
      x2 = Math.max(rawX2, rawX1 + SPARK_MIN_EXTENT);
      centerX = (x1 + x2) / 2;
    }

    let lane = laneEdges.findIndex((edge) => edge + SPARK_LANE_GAP <= x1);
    if (lane === -1) {
      lane = laneEdges.length;
      laneEdges.push(x2);
    } else {
      laneEdges[lane] = x2;
    }

    items.push({
      record,
      id: record.id,
      type: record.type,
      title: record.title,
      isPoint: point,
      lane,
      x1,
      x2,
      centerX,
    });
  }

  return { items, laneCount: laneEdges.length };
}
