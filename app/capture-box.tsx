"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import {
  FLINT_RECORD_TYPES,
  FLINT_RECORD_TYPE_LABELS,
} from "@/lib/flint-records";
import type { FlintRecordType } from "@/lib/flint-records";

import { createRecordAction, initialCaptureState } from "./capture-actions";

export function CaptureBox() {
  const [state, formAction, pending] = useActionState(
    createRecordAction,
    initialCaptureState,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const whenRef = useRef<HTMLInputElement>(null);
  const whereRef = useRef<HTMLInputElement>(null);
  const handledNonce = useRef(0);

  const [type, setType] = useState<FlintRecordType>("note");
  const [showWhen, setShowWhen] = useState(false);
  const [showWhere, setShowWhere] = useState(false);
  const [hasTitle, setHasTitle] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // The cursor opens in the title the moment the surface appears.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // After a save: clear the surface, drop structure back to default, and
  // return the cursor to the title so the next thought can land immediately.
  useEffect(() => {
    if (state.status === "saved" && state.nonce !== handledNonce.current) {
      handledNonce.current = state.nonce;
      formRef.current?.reset();
      setType("note");
      setShowWhen(false);
      setShowWhere(false);
      setHasTitle(false);
      setSavedId(state.id);
      titleRef.current?.focus();
    }
  }, [state]);

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const error = state.status === "error" ? state.error : null;

  return (
    <form
      ref={formRef}
      action={formAction}
      onKeyDown={handleKeyDown}
      onInput={() => {
        if (savedId) setSavedId(null);
      }}
      className="rounded-2xl border border-parchment-border bg-parchment-raised p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
    >
      <input type="hidden" name="type" value={type} />

      <div className="flex items-start justify-between gap-4">
        <input
          ref={titleRef}
          name="title"
          autoComplete="off"
          aria-label="Title"
          onChange={(event) => setHasTitle(event.target.value.trim().length > 0)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "capture-error" : undefined}
          placeholder="What do you want to remember?"
          className="w-full border-none bg-transparent font-serif text-2xl leading-snug text-obsidian outline-none placeholder:text-stone-soft"
        />
        {savedId ? (
          <Link
            href={`/records/${savedId}`}
            className="mt-1 inline-flex shrink-0 items-center gap-2 text-sm text-ember transition hover:text-obsidian"
          >
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-ember" aria-hidden />
            Saved · view
          </Link>
        ) : null}
      </div>

      <textarea
        name="summary"
        rows={3}
        autoComplete="off"
        aria-label="Summary"
        placeholder="Why does it matter? Add a few lines."
        className="mt-3 w-full resize-none border-none bg-transparent text-base leading-7 text-obsidian outline-none placeholder:text-stone-soft"
      />

      {error ? (
        <p
          id="capture-error"
          role="alert"
          className="mt-2 flex items-center gap-2 text-sm text-obsidian"
        >
          <span className="inline-block h-1.5 w-1.5 rotate-45 bg-ember" aria-hidden />
          {error}
        </p>
      ) : null}

      {savedId ? (
        <p
          role="status"
          className="mt-2 flex items-center gap-2 text-sm text-stone-warm"
        >
          <span className="inline-block h-1.5 w-1.5 rotate-45 bg-ember" aria-hidden />
          Saved. Add another whenever you’re ready.
        </p>
      ) : null}

      <div className="mt-5 border-t border-parchment-border pt-4">
        {/* When and where: quiet, optional, opened only on request. */}
        <div className="flex flex-wrap items-center gap-2">
          {showWhen ? (
            <input
              ref={whenRef}
              name="when"
              autoComplete="off"
              aria-label="When"
              placeholder="1898 or late spring"
              className="rounded-full border border-ember/60 bg-parchment px-3 py-1.5 text-sm text-obsidian outline-none placeholder:text-stone-soft focus:border-ember"
            />
          ) : (
            <MetaChip
              label="when"
              onClick={() => {
                setShowWhen(true);
                requestAnimationFrame(() => whenRef.current?.focus());
              }}
            />
          )}

          {showWhere ? (
            <input
              ref={whereRef}
              name="where"
              autoComplete="off"
              aria-label="Where"
              placeholder="Manila or the kitchen table"
              className="rounded-full border border-ember/60 bg-parchment px-3 py-1.5 text-sm text-obsidian outline-none placeholder:text-stone-soft focus:border-ember"
            />
          ) : (
            <MetaChip
              label="where"
              onClick={() => {
                setShowWhere(true);
                requestAnimationFrame(() => whereRef.current?.focus());
              }}
            />
          )}
        </div>

        {/* Type: chosen after the thought is safe. Defaults to Note. */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {FLINT_RECORD_TYPES.reduce<React.ReactNode[]>((chips, recordType) => {
            const selected = type === recordType;
            chips.push(
              <button
                key={recordType}
                type="button"
                aria-pressed={selected}
                onClick={() => setType(recordType)}
                className={
                  selected
                    ? "rounded-full bg-obsidian px-3.5 py-1.5 text-sm font-medium text-parchment transition"
                    : "rounded-full border border-parchment-border px-3.5 py-1.5 text-sm text-stone-warm transition hover:border-ember/60 hover:text-obsidian"
                }
              >
                {FLINT_RECORD_TYPE_LABELS[recordType]}
              </button>,
            );
            return chips;
          }, [])}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-stone-soft">
            Saved as a note unless you choose another type.
          </p>
          <button
            type="submit"
            disabled={pending || !hasTitle}
            className="inline-flex items-center gap-2 rounded-full bg-obsidian px-5 py-2.5 text-sm font-semibold text-parchment transition hover:bg-obsidian/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-raised disabled:cursor-not-allowed disabled:bg-stone-warm/40 disabled:text-parchment/70"
          >
            {pending ? "Keeping…" : "Keep it"}
            <span aria-hidden className="hidden text-parchment/60 sm:inline">
              ⌘↵
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

function MetaChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-parchment-border px-3 py-1.5 text-sm text-stone-warm transition hover:border-ember/60 hover:text-obsidian"
    >
      <span aria-hidden className="text-stone-soft">
        +
      </span>
      {label}
    </button>
  );
}
