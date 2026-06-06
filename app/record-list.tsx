import Link from "next/link";

import { FLINT_RECORD_TYPE_LABELS } from "@/lib/flint-records";
import type { FlintRecord } from "@/lib/flint-records";

import { RecordCardMenu } from "./record-card-menu";

type RecordListProps = {
  records: FlintRecord[];
  labelledBy: string;
  showActions?: boolean;
};

function metaLine(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(" · ");
}

export function RecordList({
  records,
  labelledBy,
  showActions = false,
}: RecordListProps) {
  return (
    <div className="flex flex-col gap-3" aria-labelledby={labelledBy}>
      {records.map((record) => {
        const whenWhere = metaLine([record.when, record.where]);

        return (
          <article
            key={record.id}
            className="relative rounded-xl border border-parchment-border bg-parchment-raised transition hover:border-ember/60"
          >
            <Link
              href={`/records/${record.id}`}
              className="block p-5 pr-12"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
                {FLINT_RECORD_TYPE_LABELS[record.type]}
              </p>
              <h2 className="mt-2 font-serif text-xl text-obsidian">
                {record.title}
              </h2>
              {record.summary ? (
                <p className="mt-3 line-clamp-2 text-stone-warm">
                  {record.summary}
                </p>
              ) : null}
              {whenWhere ? (
                <p className="mt-4 text-sm text-stone-soft">{whenWhere}</p>
              ) : null}
            </Link>
            {showActions ? <RecordCardMenu recordId={record.id} /> : null}
          </article>
        );
      })}
    </div>
  );
}
