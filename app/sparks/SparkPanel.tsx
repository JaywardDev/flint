"use client";

import Link from "next/link";

import { FLINT_RECORD_TYPE_LABELS } from "@/lib/flint-records";
import type { FlintRecord } from "@/lib/flint-records";

import { SPARK_TYPE_COLOR } from "./useSparkScale";

/**
 * The selected-record detail panel. A plain DOM element layered above the SVG
 * map — never inside it — so text, links, and focus behave like normal HTML.
 * Shows the human `when` label rather than the parsed year integers.
 */
export function SparkPanel({
  record,
  onClose,
}: {
  record: FlintRecord;
  onClose: () => void;
}) {
  const where = record.where?.trim();
  const when = record.when?.trim();
  const summary = record.summary?.trim();

  return (
    <aside
      aria-label={`Details for ${record.title}`}
      className="absolute right-6 top-6 z-10 w-80 max-w-[calc(100%-3rem)] rounded-2xl border border-parchment-border bg-parchment-raised/95 p-5 shadow-[0_12px_32px_rgba(26,26,29,0.16)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: SPARK_TYPE_COLOR[record.type] }}
          />
          {FLINT_RECORD_TYPE_LABELS[record.type]}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-stone-warm transition hover:bg-parchment hover:text-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <h2 className="mt-3 font-serif text-2xl leading-tight text-obsidian">
        {record.title}
      </h2>

      {when ? <p className="mt-3 text-sm text-stone-warm">{when}</p> : null}
      {where ? <p className="mt-1 text-sm text-stone-soft">{where}</p> : null}

      {summary ? (
        <p className="mt-4 line-clamp-4 text-sm leading-6 text-stone-warm">
          {summary}
        </p>
      ) : null}

      <Link
        href={`/records/${record.id}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ember transition hover:text-obsidian"
      >
        Open full record
        <span aria-hidden>→</span>
      </Link>
    </aside>
  );
}
