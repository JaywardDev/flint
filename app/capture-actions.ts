"use server";

import { revalidatePath } from "next/cache";

import {
  createFlintRecord,
  FLINT_RECORD_TYPES,
  parseFlintYearRange,
} from "@/lib/flint-records";
import type { FlintRecordType, FlintSupabaseClient } from "@/lib/flint-records";
import type { AddRecordState } from "@/app/capture-state";
import { requireUser } from "@/lib/auth/server";
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

export async function createRecordAction(
  _prevState: AddRecordState,
  formData: FormData,
): Promise<AddRecordState> {
  const user = await requireUser();
  const supabase = await createClient();
  const recordsClient = supabase as unknown as FlintSupabaseClient;

  const title = optionalText(text(formData.get("title")));

  if (!title) {
    return { status: "error", error: "Add a title first, then keep it." };
  }

  const when = optionalText(text(formData.get("when")));
  const yearRange = when ? parseFlintYearRange(when) : null;

  const record = await createFlintRecord(recordsClient, user.id, {
    type: requireRecordType(text(formData.get("type"))),
    title,
    summary: optionalText(text(formData.get("summary"))),
    when,
    start_year: yearRange?.startYear ?? null,
    end_year: yearRange?.endYear ?? null,
    where: optionalText(text(formData.get("where"))),
  });

  // Refresh notebook views without taking the user away from capture.
  revalidatePath("/records");
  revalidatePath("/search");

  return { status: "saved", id: record.id, nonce: Date.now() };
}
