"use server";

import { revalidatePath } from "next/cache";

import { createFlintRecord, FLINT_RECORD_TYPES } from "@/lib/flint-records";
import type { FlintRecordType, FlintSupabaseClient } from "@/lib/flint-records";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export type AddRecordState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "saved"; id: string; nonce: number };

export const initialCaptureState: AddRecordState = { status: "idle" };

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

export async function createRecordAction(
  _prevState: AddRecordState,
  formData: FormData,
): Promise<AddRecordState> {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;

  const title = optionalText(text(formData.get("title")));

  if (!title) {
    return { status: "error", error: "Jot a title first, then keep it." };
  }

  const record = await createFlintRecord(recordsClient, user.id, {
    type: requireRecordType(text(formData.get("type"))),
    title,
    summary: optionalText(text(formData.get("summary"))),
    when: optionalText(text(formData.get("when"))),
    where: optionalText(text(formData.get("where"))),
  });

  // Refresh the list below the capture box so the new record appears
  // immediately, without taking the user away from the capture surface.
  revalidatePath("/");

  return { status: "saved", id: record.id, nonce: Date.now() };
}
