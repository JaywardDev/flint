"use client";

import { formatFlintTimelineYear } from "@/lib/flint-records";

import {
  SPARK_BAR_HEIGHT,
  SPARK_POINT_RADIUS,
  SPARK_TYPE_COLOR,
  sparkErasInView,
  yearToX,
  type SparkLayout,
  type SparkLayoutItem,
  type SparkZoomMode,
} from "./useSparkScale";

// Vertical rhythm of the map, in SVG user units (== px at scale 1).
const ERA_LABEL_BASELINE = 14;
const TOP_PADDING = 30;
const LANE_HEIGHT = 24;
const AXIS_BOTTOM_PADDING = 30;
// The SVG fills the measured container, but never collapses below this.
const MIN_HEIGHT = 400;

const PARCHMENT_BORDER = "#DDD0BA";
const STONE_SOFT = "#8A857D";
const OBSIDIAN = "#1A1A1D";
const EMBER = "#C79B45";

// Label sizing: titles render at 10px, and we approximate the advance width of
// each glyph at 6.5px to decide whether the full title fits. Labels are never
// truncated — they either fit completely or are dropped entirely.
const LABEL_FONT_SIZE = 10;
const LABEL_CHAR_WIDTH = 6.5;
// Small gap between a record's right edge and the start of its label.
const LABEL_GAP = 4;
// Minimum clearance the label must keep from the next record / SVG boundary.
const LABEL_CLEARANCE = 8;

type SparkMapProps = {
  layout: SparkLayout;
  mode: SparkZoomMode;
  width: number;
  height: number;
  selectedId: string | null;
  hoverId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null, point?: { x: number; y: number }) => void;
};

export function SparkMap({
  layout,
  mode,
  width,
  height,
  selectedId,
  hoverId,
  onSelect,
  onHover,
}: SparkMapProps) {
  // The SVG fills the available vertical space (min 400px); the axis sits near
  // the bottom of that space rather than at a height derived from lane count.
  const svgHeight = Math.max(MIN_HEIGHT, height);
  const axisY = svgHeight - AXIS_BOTTOM_PADDING;

  const laneCenterY = (lane: number) =>
    TOP_PADDING + lane * LANE_HEIGHT + LANE_HEIGHT / 2;

  // For each record, the left edge of the next record in the same lane. Labels
  // may only fill the gap up to this neighbour (or the SVG's right boundary).
  const nextLaneX = new Map<string, number>();
  const lanes = new Map<number, SparkLayoutItem[]>();
  for (const item of layout.items) {
    const bucket = lanes.get(item.lane) ?? [];
    bucket.push(item);
    lanes.set(item.lane, bucket);
  }
  for (const bucket of lanes.values()) {
    bucket.sort((a, b) => a.x1 - b.x1);
    for (let i = 0; i < bucket.length; i += 1) {
      nextLaneX.set(bucket[i].id, bucket[i + 1]?.x1 ?? Infinity);
    }
  }

  const eraBands = sparkErasInView(mode);

  // Axis ticks live at era boundaries plus the right edge of the window, so the
  // labels line up with the background bands rather than at arbitrary decades.
  const tickYears = Array.from(
    new Set([...eraBands.map((band) => band.visibleStart), mode.maxYear]),
  ).sort((a, b) => a - b);

  return (
    <svg
      width={width}
      height={svgHeight}
      viewBox={`0 0 ${width} ${svgHeight}`}
      role="group"
      aria-label="Time map of your records across history"
      style={{ display: "block" }}
    >
      {/* Background catcher: a click on empty map space dismisses the panel. */}
      <rect
        x={0}
        y={0}
        width={width}
        height={svgHeight}
        fill="transparent"
        onClick={() => onSelect(null)}
      />

      {/* Era bands + labels, drawn first so records and the axis sit on top. */}
      {eraBands.map((band, index) => {
        const x = yearToX(band.visibleStart, mode.segments, width);
        const bandWidth =
          yearToX(band.visibleEnd, mode.segments, width) - x;
        if (bandWidth <= 0) return null;

        return (
          <g key={band.id} pointerEvents="none">
            <rect
              x={x}
              y={0}
              width={bandWidth}
              height={axisY}
              fill={OBSIDIAN}
              opacity={index % 2 === 0 ? 0.04 : 0.065}
            />
            {bandWidth > 40 ? (
              <text
                x={x + bandWidth / 2}
                y={ERA_LABEL_BASELINE}
                textAnchor="middle"
                fontSize={11}
                fill={STONE_SOFT}
              >
                {band.label}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Axis line and boundary-year ticks. */}
      <line
        x1={0}
        y1={axisY}
        x2={width}
        y2={axisY}
        stroke={PARCHMENT_BORDER}
        strokeWidth={1}
      />
      {tickYears.map((year) => {
        const x = yearToX(year, mode.segments, width);
        const anchor = x <= 1 ? "start" : x >= width - 1 ? "end" : "middle";
        return (
          <g key={year} pointerEvents="none">
            <line
              x1={x}
              y1={axisY - 4}
              x2={x}
              y2={axisY + 4}
              stroke={PARCHMENT_BORDER}
              strokeWidth={1}
            />
            <text
              x={x}
              y={axisY + 18}
              textAnchor={anchor}
              fontSize={10}
              fill={STONE_SOFT}
            >
              {formatFlintTimelineYear(year)}
            </text>
          </g>
        );
      })}

      {/* Leader lines: a faint dashed drop from each record to the axis. */}
      {layout.items.map((item) => (
        <line
          key={`leader-${item.id}`}
          x1={item.centerX}
          y1={laneCenterY(item.lane)}
          x2={item.centerX}
          y2={axisY}
          stroke={STONE_SOFT}
          strokeWidth={0.5}
          strokeDasharray="2 2"
          opacity={0.3}
          pointerEvents="none"
        />
      ))}

      {/* Records: dots for point events, rounded bars for ranges. */}
      {layout.items.map((item) => (
        <SparkRecord
          key={item.id}
          item={item}
          cy={laneCenterY(item.lane)}
          width={width}
          nextX={nextLaneX.get(item.id) ?? Infinity}
          isSelected={item.id === selectedId}
          isHovered={item.id === hoverId}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </svg>
  );
}

function SparkRecord({
  item,
  cy,
  width,
  nextX,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  item: SparkLayoutItem;
  cy: number;
  width: number;
  nextX: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null, point?: { x: number; y: number }) => void;
}) {
  const fill = SPARK_TYPE_COLOR[item.type];
  const barWidth = item.x2 - item.x1;
  const active = isSelected || isHovered;

  const strokeProps = isSelected
    ? { stroke: EMBER, strokeWidth: 2, strokeOpacity: 1 }
    : isHovered
      ? { stroke: EMBER, strokeWidth: 1.5, strokeOpacity: 0.6 }
      : { stroke: "none", strokeWidth: 0, strokeOpacity: 0 };

  // A label shows only when the full title fits in the space after the record's
  // right edge, keeping at least 8px clear of the next record in the lane (or
  // the SVG boundary). Otherwise it is dropped — the title lives in the panel.
  const rightEdge = item.isPoint
    ? item.centerX + SPARK_POINT_RADIUS
    : item.x2;
  const labelX = rightEdge + LABEL_GAP;
  const boundary = Math.min(nextX, width);
  const titleWidth = item.title.length * LABEL_CHAR_WIDTH;
  const showLabel = labelX + titleWidth + LABEL_CLEARANCE <= boundary;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={item.title}
      style={{ cursor: "pointer" }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
      onMouseEnter={(event) =>
        onHover(item.id, { x: event.clientX, y: event.clientY })
      }
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(item.id)}
      onBlur={() => onHover(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item.id);
        }
      }}
    >
      {item.isPoint ? (
        <circle
          cx={item.centerX}
          cy={cy}
          r={active ? SPARK_POINT_RADIUS + 1 : SPARK_POINT_RADIUS}
          fill={fill}
          {...strokeProps}
        />
      ) : (
        <rect
          x={item.x1}
          y={cy - SPARK_BAR_HEIGHT / 2}
          width={barWidth}
          height={SPARK_BAR_HEIGHT}
          rx={4}
          fill={fill}
          {...strokeProps}
        />
      )}

      {showLabel ? (
        <text
          x={labelX}
          y={cy}
          dominantBaseline="central"
          fontSize={LABEL_FONT_SIZE}
          fontWeight={isSelected ? 600 : 400}
          fill={OBSIDIAN}
          pointerEvents="none"
        >
          {item.title}
        </text>
      ) : null}
    </g>
  );
}
