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
const AXIS_GAP = 24;
const AXIS_BOTTOM_PADDING = 30;

const PARCHMENT_BORDER = "#DDD0BA";
const STONE_SOFT = "#8A857D";
const OBSIDIAN = "#1A1A1D";
const EMBER = "#C79B45";

// Rough advance width of the 12px Inter label glyphs; good enough to decide how
// many characters fit before we have to truncate with an ellipsis.
const LABEL_CHAR_WIDTH = 6.2;
const MAX_LABEL_WIDTH = 180;

type SparkMapProps = {
  layout: SparkLayout;
  mode: SparkZoomMode;
  width: number;
  selectedId: string | null;
  hoverId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
};

function truncateToWidth(text: string, maxWidth: number): string {
  const maxChars = Math.floor(maxWidth / LABEL_CHAR_WIDTH);
  if (maxChars <= 1) return "";
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

export function SparkMap({
  layout,
  mode,
  width,
  selectedId,
  hoverId,
  onSelect,
  onHover,
}: SparkMapProps) {
  const laneRows = Math.max(1, layout.laneCount);
  const axisY = TOP_PADDING + laneRows * LANE_HEIGHT + AXIS_GAP;
  const height = axisY + AXIS_BOTTOM_PADDING;

  const laneCenterY = (lane: number) =>
    TOP_PADDING + lane * LANE_HEIGHT + LANE_HEIGHT / 2;

  const eraBands = sparkErasInView(mode);

  // Axis ticks live at era boundaries plus the right edge of the window, so the
  // labels line up with the background bands rather than at arbitrary decades.
  const tickYears = Array.from(
    new Set([...eraBands.map((band) => band.visibleStart), mode.maxYear]),
  ).sort((a, b) => a - b);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label="Time map of your records across history"
      style={{ display: "block" }}
    >
      {/* Background catcher: a click on empty map space dismisses the panel. */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
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
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  item: SparkLayoutItem;
  cy: number;
  width: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const fill = SPARK_TYPE_COLOR[item.type];
  const barWidth = item.x2 - item.x1;
  const active = isSelected || isHovered;

  // Labels are suppressed by default to keep dense stretches legible; a wide
  // bar earns a standing label, and hover or selection always reveals one.
  const showLabel =
    isSelected || isHovered || (!item.isPoint && barWidth > 40);

  const strokeProps = isSelected
    ? { stroke: EMBER, strokeWidth: 2, strokeOpacity: 1 }
    : isHovered
      ? { stroke: EMBER, strokeWidth: 1.5, strokeOpacity: 0.6 }
      : { stroke: "none", strokeWidth: 0, strokeOpacity: 0 };

  const labelX = item.isPoint
    ? item.centerX + SPARK_POINT_RADIUS + 4
    : item.x2 + 4;
  const labelMaxWidth = Math.min(MAX_LABEL_WIDTH, width - labelX - 4);
  const label = showLabel ? truncateToWidth(item.title, labelMaxWidth) : "";

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
      onMouseEnter={() => onHover(item.id)}
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

      {label ? (
        <text
          x={labelX}
          y={cy}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={isSelected ? 600 : 400}
          fill={OBSIDIAN}
          pointerEvents="none"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}
