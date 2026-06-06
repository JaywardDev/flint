"use server";

import { redirect } from "next/navigation";

import { createFlintRecord, FLINT_RECORD_TYPES } from "@/lib/flint-records";
import type { FlintRecordType, FlintSupabaseClient } from "@/lib/flint-records";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export type AddRecordState = {
  error?: string;
  values: {
    type: string;
    title: string;
    summary: string;
    when: string;
    where: string;
  };
};

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

  const values = {
    type: text(formData.get("type")),
    title: text(formData.get("title")),
    summary: text(formData.get("summary")),
    when: text(formData.get("when")),
    where: text(formData.get("where")),
  };

  const title = optionalText(values.title);

  if (!title) {
    return { error: "Add a title before saving.", values };
  }

  const record = await createFlintRecord(recordsClient, user.id, {
    type: requireRecordType(values.type),
    title,
    summary: optionalText(values.summary),
    when: optionalText(values.when),
    where: optionalText(values.where),
  });

  redirect(`/records/${record.id}`);
}
