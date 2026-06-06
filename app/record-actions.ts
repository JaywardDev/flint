"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/server";
import {
  deleteFlintRecord,
  FLINT_RECORD_TYPES,
  updateFlintRecord,
} from "@/lib/flint-records";
import type { FlintRecordType, FlintSupabaseClient } from "@/lib/flint-records";
import { createClient } from "@/lib/supabase/server";

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requireRecordType(value: string): FlintRecordType {
  if (FLINT_RECORD_TYPES.includes(value as FlintRecordType)) {
    return value as FlintRecordType;
  }

  return "note";
}

export async function updateRecordAction(recordId: string, formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;
  const title = optionalText(text(formData.get("title")));

  if (!title) {
    throw new Error("Record title is required.");
  }

  await updateFlintRecord(recordsClient, user.id, recordId, {
    type: requireRecordType(text(formData.get("type"))),
    title,
    summary: optionalText(text(formData.get("summary"))),
    when: optionalText(text(formData.get("when"))),
    where: optionalText(text(formData.get("where"))),
  });

  revalidatePath("/records");
  revalidatePath("/search");
  revalidatePath(`/records/${recordId}`);

  redirect(`/records/${recordId}`);
}

export async function deleteRecordAction(recordId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;

  try {
    await deleteFlintRecord(recordsClient, user.id, recordId);
  } catch {
    return { status: "error" as const };
  }

  revalidatePath("/records");
  revalidatePath("/search");
  revalidatePath(`/records/${recordId}`);

  return { status: "deleted" as const };
}
