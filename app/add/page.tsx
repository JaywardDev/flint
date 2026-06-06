import Link from "next/link";

import { requireUser } from "@/lib/auth/server";

import { AddRecordForm } from "./add-record-form";

export default async function AddPage() {
  await requireUser();
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <header className="mb-10">
        <Link
          href="/"
          className="text-sm font-medium text-stone-warm transition hover:text-obsidian"
        >
          Back to records
        </Link>
        <h1 className="mt-6 font-serif text-4xl text-obsidian">Add record</h1>
        <p className="mt-3 text-base leading-7 text-stone-warm">
          Jot down the thing itself. Keep it plain and quick.
        </p>
      </header>

      <AddRecordForm />
    </main>
  );
}
