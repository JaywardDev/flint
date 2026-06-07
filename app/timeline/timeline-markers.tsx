"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { RECORD_TYPE_DOT } from "@/lib/flint-records";
import type { FlintRecord } from "@/lib/flint-records";

// Opening one marker closes every other one — even across separate era rails —
// by broadcasting a document-level event the other markers listen for. This
// mirrors the record card menu's coordination so only one tooltip is ever open.
type MarkerOpenEvent = CustomEvent<{ markerId: string }>;

const MARKER_OPEN_EVENT = "flint-timeline-marker-open";

type MarkerPlacement = "right" | "top";

// A single timeline marker: a small type-coloured dot that reveals the record
// title in a tooltip. The dot carries the type as a quiet colour hint (the only
// surviving type cue now that the cards and pills are gone). The title lives in
// the tooltip so the rail stays dense and reads as a density map, not a list.
//
// Desktop reveals on hover; touch reveals on tap; keyboard reveals on focus.
// The tooltip is a link to the record, so a second, deliberate interaction
// (click/Enter) navigates — a tap on the marker never navigates by itself.
function TimelineMarker({
  record,
  placement = "right",
}: {
  record: FlintRecord;
  placement?: MarkerPlacement;
}) {
  const reactId = useId();
  const markerId = `timeline-marker-${reactId}`;
  const labelId = `${markerId}-label`;
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  function openMarker() {
    setOpen(true);
    document.dispatchEvent(
      new CustomEvent(MARKER_OPEN_EVENT, { detail: { markerId } }),
    );
  }

  function closeMarker() {
    setOpen(false);
  }

  useEffect(() => {
    function closeForOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMarker();
      }
    }

    function closeForEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMarker();
      }
    }

    function closeForOtherMarker(event: Event) {
      const openEvent = event as MarkerOpenEvent;
      if (openEvent.detail.markerId !== markerId) {
        closeMarker();
      }
    }

    document.addEventListener("pointerdown", closeForOutsidePointer);
    document.addEventListener("keydown", closeForEscape);
    document.addEventListener(MARKER_OPEN_EVENT, closeForOtherMarker);

    return () => {
      document.removeEventListener("pointerdown", closeForOutsidePointer);
      document.removeEventListener("keydown", closeForEscape);
      document.removeEventListener(MARKER_OPEN_EVENT, closeForOtherMarker);
    };
  }, [markerId]);

  // The bridge padding (pb-2 / pl-2) keeps the hover region contiguous from the
  // dot to the tooltip: without it the empty gap between them would fire
  // pointerleave and dismiss the tooltip before the pointer could reach it.
  const tooltipPosition =
    placement === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 pb-2"
      : "left-full top-1/2 -translate-y-1/2 pl-2";

  return (
    // Hover/focus handlers live on the wrapper so moving the pointer from the
    // dot onto the tooltip link keeps it open rather than dismissing it.
    <span
      ref={rootRef}
      className="relative flex items-center justify-center"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") openMarker();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") closeMarker();
      }}
      onFocus={openMarker}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) {
          closeMarker();
        }
      }}
    >
      <button
        type="button"
        aria-labelledby={labelId}
        aria-expanded={open}
        onClick={openMarker}
        className="flex h-4 w-4 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
      >
        <span
          aria-hidden
          className={`h-2.5 w-2.5 rounded-full ${RECORD_TYPE_DOT[record.type]}`}
        />
        <span id={labelId} className="sr-only">
          {record.title}
        </span>
      </button>

      {open ? (
        <span className={`absolute z-20 ${tooltipPosition}`}>
          <Link
            href={`/records/${record.id}`}
            className="block max-w-[14rem] break-words rounded-lg border border-parchment-border bg-parchment-raised px-3 py-1.5 text-sm font-medium text-obsidian shadow-sm transition hover:border-ember/60 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            {record.title}
          </Link>
        </span>
      ) : null}
    </span>
  );
}

// Dated era: a compact vertical rail of markers, one thin row per record. The
// connector line runs above and below each dot (omitted above the first and
// below the last) so the rail stays continuous through the gaps. The muted
// start year is kept beside each marker for orientation and as a density cue —
// clustered close years visibly read as a dense stretch of history.
export function EraRail({ records }: { records: FlintRecord[] }) {
  return (
    <ol className="flex flex-col">
      {records.map((record, index) => {
        const isFirst = index === 0;
        const isLast = index === records.length - 1;
        const yearLabel =
          record.start_year == null ? "—" : String(record.start_year);

        return (
          <li key={record.id} className="flex gap-3">
            <div className="w-12 shrink-0 pt-2 text-right text-[11px] leading-none tabular-nums text-stone-soft">
              {yearLabel}
            </div>

            <div className="flex w-4 shrink-0 flex-col items-center">
              <span
                aria-hidden
                className={`h-2 w-px ${isFirst ? "" : "bg-parchment-border"}`}
              />
              <TimelineMarker record={record} />
              {!isLast ? (
                <span aria-hidden className="h-4 w-px bg-parchment-border" />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// Undated catch-all: no chronological position to express, so the records sit
// as a loose wrapped cluster of markers rather than a rail. Tooltips open above
// the dot here since there is no year column to the left.
export function UndatedMarkers({ records }: { records: FlintRecord[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-3 pt-2">
      {records.map((record) => (
        <li key={record.id} className="flex">
          <TimelineMarker record={record} placement="top" />
        </li>
      ))}
    </ul>
  );
}
