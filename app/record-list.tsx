"use client";

import { useState } from "react";

import { FLINT_RECORD_TYPE_LABELS } from "@/lib/flint-records";
import type { FlintRecord } from "@/lib/flint-records";

type RecordListProps = {
  records: FlintRecord[];
  labelledBy: string;
};

function metaLine(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(" · ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function RecordList({ records, labelledBy }: RecordListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3" aria-labelledby={labelledBy}>
      {records.map((record) => {
        const expanded = expandedId === record.id;
        const panelId = `record-${record.id}-details`;
        const summaryId = `record-${record.id}-summary`;
        const whenWhere = metaLine([record.when, record.where]);
        const wasEdited = record.updated_at !== record.created_at;

        return (
          <article
            key={record.id}
            className="rounded-xl border border-parchment-border bg-parchment-raised transition hover:border-ember/60"
          >
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpandedId(expanded ? null : record.id)}
              className="flex w-full items-start justify-between gap-4 p-5 text-left"
            >
              <span className="min-w-0">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
                  {FLINT_RECORD_TYPE_LABELS[record.type]}
                </span>
                <span className="mt-2 block font-serif text-xl text-obsidian">
                  {record.title}
                </span>
                {whenWhere ? (
                  <span className="mt-2 block text-sm text-stone-soft">
                    {whenWhere}
                  </span>
                ) : null}
                {record.summary ? (
                  <span
                    id={summaryId}
                    className={
                      expanded
                        ? "mt-3 block whitespace-pre-line text-stone-warm"
                        : "mt-3 line-clamp-2 block text-stone-warm"
                    }
                  >
                    {record.summary}
                  </span>
                ) : null}
              </span>
              <span
                aria-hidden
                className="mt-2 shrink-0 text-xl leading-none text-stone-soft"
              >
                {expanded ? "⌃" : "⌄"}
              </span>
            </button>

            <div
              id={panelId}
              className={expanded ? "border-t border-parchment-border px-5 pb-5 pt-4" : "hidden"}
            >
              <dl className="grid gap-3 text-sm text-stone-warm sm:grid-cols-2">
                {record.when ? (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.16em] text-stone-soft">
                      When
                    </dt>
                    <dd className="mt-1 text-obsidian">{record.when}</dd>
                  </div>
                ) : null}
                {record.where ? (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.16em] text-stone-soft">
                      Where
                    </dt>
                    <dd className="mt-1 text-obsidian">{record.where}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-stone-soft">
                    Added
                  </dt>
                  <dd className="mt-1 text-obsidian">
                    {formatDate(record.created_at)}
                  </dd>
                </div>
                {wasEdited ? (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.16em] text-stone-soft">
                      Updated
                    </dt>
                    <dd className="mt-1 text-obsidian">
                      {formatDate(record.updated_at)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </article>
        );
      })}
    </div>
  );
}
