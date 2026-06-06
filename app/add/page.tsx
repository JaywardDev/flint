import Link from "next/link";

import { FLINT_RECORD_TYPES } from "@/lib/flint-records";

export default function AddPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <header className="mb-10">
        <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-950">
          Back to records
        </Link>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-stone-950">
          Add record
        </h1>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Jot down the thing itself. Keep it plain and quick.
        </p>
      </header>

      <form className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="type">
            Type
            <select
              id="type"
              name="type"
              required
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-950 outline-none transition focus:border-stone-400"
            >
              {FLINT_RECORD_TYPES.reduce<React.ReactNode[]>((items, recordType) => {
                items.push(
                  <option key={recordType} value={recordType}>
                    {recordType}
                  </option>,
                );
                return items;
              }, [])}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="title">
            Title
            <input
              id="title"
              name="title"
              required
              placeholder="What should this record be called?"
              className="rounded-2xl border border-stone-200 px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="summary">
            Summary
            <textarea
              id="summary"
              name="summary"
              rows={5}
              placeholder="A few lines are enough."
              className="resize-none rounded-2xl border border-stone-200 px-4 py-3 text-base leading-7 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="when">
            When
            <input
              id="when"
              name="when"
              placeholder="Plain text, like 1898 or late spring"
              className="rounded-2xl border border-stone-200 px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700" htmlFor="where">
            Where
            <input
              id="where"
              name="where"
              placeholder="Plain text, like Manila or the kitchen table"
              className="rounded-2xl border border-stone-200 px-4 py-3 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Save record
        </button>
      </form>
    </main>
  );
}
