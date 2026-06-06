"use client";

import { useActionState } from "react";

import {
  FLINT_RECORD_TYPES,
  FLINT_RECORD_TYPE_LABELS,
} from "@/lib/flint-records";

import { createRecordAction, type AddRecordState } from "./actions";

const initialState: AddRecordState = {
  values: { type: "note", title: "", summary: "", when: "", where: "" },
};

export function AddRecordForm() {
  const [state, formAction, pending] = useActionState(
    createRecordAction,
    initialState,
  );
  const values = state.values;
  const hasTitleError = Boolean(state.error);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-parchment-border bg-parchment-raised p-6"
    >
      <div className="grid gap-5">
        <label
          className="grid gap-2 text-sm font-medium text-stone-warm"
          htmlFor="type"
        >
          Type
          <select
            id="type"
            name="type"
            required
            defaultValue={values.type}
            className="rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base text-obsidian outline-none transition focus:border-ember focus:ring-1 focus:ring-ember"
          >
            {FLINT_RECORD_TYPES.reduce<React.ReactNode[]>((items, recordType) => {
              items.push(
                <option key={recordType} value={recordType}>
                  {FLINT_RECORD_TYPE_LABELS[recordType]}
                </option>,
              );
              return items;
            }, [])}
          </select>
        </label>

        <label
          className="grid gap-2 text-sm font-medium text-stone-warm"
          htmlFor="title"
        >
          Title
          <input
            id="title"
            name="title"
            required
            defaultValue={values.title}
            aria-invalid={hasTitleError}
            aria-describedby={hasTitleError ? "title-error" : undefined}
            placeholder="What should this record be called?"
            className="rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base text-obsidian outline-none transition placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
          />
          {hasTitleError ? (
            <span
              id="title-error"
              role="alert"
              className="flex items-center gap-2 text-sm text-obsidian"
            >
              <span
                className="inline-block h-1.5 w-1.5 rotate-45 bg-ember"
                aria-hidden
              />
              {state.error}
            </span>
          ) : null}
        </label>

        <label
          className="grid gap-2 text-sm font-medium text-stone-warm"
          htmlFor="summary"
        >
          Summary
          <textarea
            id="summary"
            name="summary"
            rows={5}
            defaultValue={values.summary}
            placeholder="A few lines are enough."
            className="resize-none rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base leading-7 text-obsidian outline-none transition placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
          />
        </label>

        <label
          className="grid gap-2 text-sm font-medium text-stone-warm"
          htmlFor="when"
        >
          When
          <input
            id="when"
            name="when"
            defaultValue={values.when}
            placeholder="Plain text, like 1898 or late spring"
            className="rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base text-obsidian outline-none transition placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
          />
        </label>

        <label
          className="grid gap-2 text-sm font-medium text-stone-warm"
          htmlFor="where"
        >
          Where
          <input
            id="where"
            name="where"
            defaultValue={values.where}
            placeholder="Plain text, like Manila or the kitchen table"
            className="rounded-xl border border-parchment-border bg-parchment px-4 py-3 text-base text-obsidian outline-none transition placeholder:text-stone-soft focus:border-ember focus:ring-1 focus:ring-ember"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-obsidian px-5 py-3 text-sm font-semibold text-parchment transition hover:bg-obsidian/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-raised disabled:cursor-not-allowed disabled:bg-stone-warm"
      >
        {pending ? "Saving…" : "Save record"}
      </button>
    </form>
  );
}
