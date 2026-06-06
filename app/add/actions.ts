"use server";

import { redirect } from "next/navigation";

import { createFlintRecord, FLINT_RECORD_TYPES } from "@/lib/flint-records";
import type { FlintRecordType, FlintSupabaseClient } from "@/lib/flint-records";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

function optionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function requireRecordType(value: FormDataEntryValue | null): FlintRecordType {
  if (typeof value !== "string") return "note";

  if (FLINT_RECORD_TYPES.includes(value as FlintRecordType)) {
    return value as FlintRecordType;
  }

  return "note";
}

export async function createRecordAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const title = optionalText(formData.get("title"));

  if (!title) {
    throw new Error("Title is required.");
  }

  const record = await createFlintRecord(recordsClient, user.id, {
    type: requireRecordType(formData.get("type")),
    title,
    summary: optionalText(formData.get("summary")),
    when: optionalText(formData.get("when")),
    where: optionalText(formData.get("where")),
  });

  redirect(`/records/${record.id}`);
}
