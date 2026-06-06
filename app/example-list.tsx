import { FLINT_RECORD_TYPE_LABELS } from "@/lib/flint-records";

import { EXAMPLE_RECORDS } from "./example-records";

function metaLine(when?: string, where?: string) {
  return [when, where].filter(Boolean).join(" · ");
}

/**
 * Cold-start teaching surface. Shown only when the user has no records of their
 * own, directly beneath the capture box. The dashed, muted treatment keeps
 * examples visibly distinct from real records — they fade the moment the user
 * saves their first record.
 */
export function ExampleList() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-stone-warm">
        A few examples to show the shape of a record. Add your own above — these
        fade once you do.
      </p>
      {EXAMPLE_RECORDS.map((record, index) => {
        const meta = metaLine(record.when, record.where);

        return (
          <div
            key={index}
            className="rounded-xl border border-dashed border-parchment-border bg-parchment-raised/60 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-warm">
                {FLINT_RECORD_TYPE_LABELS[record.type]}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-ember">
                <span
                  className="inline-block h-1.5 w-1.5 rotate-45 bg-ember"
                  aria-hidden
                />
                Example
              </span>
            </div>
            <h3 className="mt-2 font-serif text-xl text-obsidian">
              {record.title}
            </h3>
            <p className="mt-3 text-stone-warm">{record.summary}</p>
            {meta ? <p className="mt-4 text-sm text-stone-soft">{meta}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
