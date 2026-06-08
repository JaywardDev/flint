"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { FlintRecord } from "@/lib/flint-records";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";
import { SparkMap } from "./SparkMap";
import { SparkPanel } from "./SparkPanel";
import {
  buildSparkLayout,
  DEFAULT_SPARK_ZOOM_MODE,
  SPARK_ZOOM_MODES,
  type SparkZoomModeId,
} from "./useSparkScale";

const FALLBACK_WIDTH = 1100;
const FALLBACK_HEIGHT = 600;

/**
 * Page-level orchestrator for the Spark Time Map. Owns every piece of UI state —
 * active zoom mode, selected record, hover record, and the measured map width —
 * then wires the pure scale maths (useSparkScale) to the SVG renderer (SparkMap)
 * and the DOM detail panel (SparkPanel).
 *
 * The map is a desktop instrument: below the `lg` breakpoint (1024px) we show a
 * short note instead, and the page is reachable only from the desktop nav.
 */
export function SparkPage({ records }: { records: FlintRecord[] }) {
  const [activeModeId, setActiveModeId] = useState<SparkZoomModeId>(
    DEFAULT_SPARK_ZOOM_MODE.id,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const [height, setHeight] = useState(FALLBACK_HEIGHT);

  const containerRef = useRef<HTMLDivElement>(null);

  // Track the live size of the map column so the compression scale fills the
  // available pixels horizontally and the SVG fills the column vertically. A
  // zero dimension (e.g. while the desktop block is hidden on mobile) is
  // ignored so we keep the last good value.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      if (node.clientWidth > 0) setWidth(node.clientWidth);
      if (node.clientHeight > 0) setHeight(node.clientHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const mode = useMemo(
    () =>
      SPARK_ZOOM_MODES.find((candidate) => candidate.id === activeModeId) ??
      DEFAULT_SPARK_ZOOM_MODE,
    [activeModeId],
  );

  const layout = useMemo(
    () => buildSparkLayout(records, mode, width),
    [records, mode, width],
  );

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId],
  );

  const placedCount = layout.items.length;

  return (
    <>
      {/* Mobile: the map is desktop-only, so point people to a wider screen. */}
      <main className="flex min-h-screen flex-1 items-center justify-center px-8 py-16 text-center lg:hidden">
        <p className="max-w-sm text-balance font-serif text-xl leading-8 text-stone-warm">
          Spark is designed for a wider screen. Open Flint on desktop to explore
          your records across time.
        </p>
      </main>

      {/* Desktop: the full Time Map. */}
      <main className="hidden min-h-screen flex-col px-8 py-8 lg:flex">
        <AppHeader
          links={[
            { href: "/records", label: "Records" },
            { href: "/timeline", label: "Timeline" },
            { href: "/sparks", label: "Sparks" },
            { href: "/add", label: "Add" },
            { href: "/search", label: "Search" },
          ]}
        />

        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-obsidian">
              Spark
            </h1>
            <p className="mt-1 text-sm text-stone-soft">
              {placedCount} {placedCount === 1 ? "record" : "records"} across
              time
            </p>
          </div>

          <div
            role="group"
            aria-label="Zoom range"
            className="flex flex-wrap items-center gap-1.5"
          >
            {SPARK_ZOOM_MODES.map((zoomMode) => {
              const active = zoomMode.id === activeModeId;
              return (
                <button
                  key={zoomMode.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveModeId(zoomMode.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment ${
                    active
                      ? "bg-obsidian text-parchment"
                      : "border border-parchment-border text-stone-warm hover:border-ember/60 hover:text-obsidian"
                  }`}
                >
                  {zoomMode.label}
                </button>
              );
            })}
          </div>
        </header>

        <div
          ref={containerRef}
          className="relative w-full flex-1 overflow-hidden rounded-2xl border border-parchment-border bg-parchment-raised p-2"
        >
          {placedCount > 0 ? (
            <SparkMap
              layout={layout}
              mode={mode}
              width={Math.max(0, width - 16)}
              height={Math.max(0, height - 16)}
              selectedId={selectedId}
              hoverId={hoverId}
              onSelect={setSelectedId}
              onHover={setHoverId}
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center px-8 text-center">
              <p className="max-w-md text-sm leading-7 text-stone-warm">
                No dated records fall within this range yet. Add a record with a
                year, or widen the zoom, to see it on the map.
              </p>
            </div>
          )}

          {selectedRecord ? (
            <SparkPanel
              record={selectedRecord}
              onClose={() => setSelectedId(null)}
            />
          ) : null}
        </div>
      </main>

      <BottomNav />
    </>
  );
}
