import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createFlintRecord,
  deleteFlintRecord,
  listFlintRecordsByYear,
  searchFlintRecords,
  updateFlintRecord,
  type FlintSupabaseClient,
} from "./supabase";
import type {
  CreateFlintRecordInput,
  FlintRecord,
  FlintRecordType,
  UpdateFlintRecordInput,
} from "./types";

type RecordInsert = CreateFlintRecordInput & { user_id: string };
type RecordUpdate = UpdateFlintRecordInput;
type Order = {
  column: keyof FlintRecord;
  ascending: boolean;
  nullsFirst?: boolean;
};

type Filter =
  | { column: keyof FlintRecord; operator: "eq"; value: string }
  | { column: keyof FlintRecord; operator: "gte" | "lte"; value: number };

class FakeRecordsRequest implements PromiseLike<{ data: unknown; error: unknown }> {
  private filters: Filter[] = [];
  private searchTerm: string | null = null;
  private orders: Order[] = [];
  private shouldReturnSingle = false;
  private readonly records: FlintRecord[];
  private readonly operation: "select" | "insert" | "update" | "delete";
  private readonly values?: RecordInsert | RecordUpdate;

  constructor(
    records: FlintRecord[],
    operation: "select" | "insert" | "update" | "delete",
    values?: RecordInsert | RecordUpdate,
  ) {
    this.records = records;
    this.operation = operation;
    this.values = values;
  }

  eq(column: string, value: string) {
    this.filters.push({ column: column as keyof FlintRecord, operator: "eq", value });
    return this;
  }

  gte(column: string, value: string | number) {
    this.filters.push({
      column: column as keyof FlintRecord,
      operator: "gte",
      value: Number(value),
    });
    return this;
  }

  lte(column: string, value: string | number) {
    this.filters.push({
      column: column as keyof FlintRecord,
      operator: "lte",
      value: Number(value),
    });
    return this;
  }

  or(query: string) {
    const match = query.match(/%([^%,]+)%/);
    this.searchTerm = match?.[1].toLowerCase() ?? null;
    return this;
  }

  order(column: string, options: { ascending: boolean; nullsFirst?: boolean }) {
    this.orders.push({
      column: column as keyof FlintRecord,
      ascending: options.ascending,
      nullsFirst: options.nullsFirst,
    });
    return this;
  }

  select() {
    return this;
  }

  single() {
    this.shouldReturnSingle = true;
    return this;
  }

  then<TResult1 = { data: unknown; error: unknown }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: unknown; error: unknown }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  private execute() {
    if (this.operation === "insert") {
      const record = this.createRecord(this.values as RecordInsert);
      this.records.unshift(record);
      return { data: this.shouldReturnSingle ? record : [record], error: null };
    }

    if (this.operation === "update") {
      const existing = this.applyFilters(this.records)[0];
      if (!existing) return { data: null, error: { code: "PGRST116" } };

      Object.assign(existing, this.values, { updated_at: new Date().toISOString() });
      return { data: existing, error: null };
    }

    if (this.operation === "delete") {
      const matchingIds = new Set(
        this.applyFilters(this.records).map((record) => record.id),
      );
      const keptRecords = this.records.filter(
        (record) => !matchingIds.has(record.id),
      );
      this.records.splice(0, this.records.length, ...keptRecords);
      return { data: null, error: null };
    }

    const data = this.sortRecords(
      this.applyFilters(this.records).filter((record) =>
        this.matchesSearchTerm(record),
      ),
    );

    return {
      data: this.shouldReturnSingle ? (data[0] ?? null) : data,
      error: null,
    };
  }

  private createRecord(values: RecordInsert): FlintRecord {
    const now = new Date(
      Date.UTC(2026, 0, 1, 0, 0, this.records.length),
    ).toISOString();

    return {
      id: `record-${this.records.length + 1}`,
      user_id: values.user_id,
      type: values.type as FlintRecordType,
      title: values.title,
      summary: values.summary ?? null,
      when: values.when ?? null,
      start_year: values.start_year ?? null,
      end_year: values.end_year ?? null,
      where: values.where ?? null,
      created_at: now,
      updated_at: now,
    };
  }

  private applyFilters(records: FlintRecord[]) {
    return records.filter((record) =>
      this.filters.every((filter) => {
        const value = record[filter.column];

        if (filter.operator === "eq") return value === filter.value;
        if (typeof value !== "number") return false;
        if (filter.operator === "gte") return value >= filter.value;
        return value <= filter.value;
      }),
    );
  }

  private sortRecords(records: FlintRecord[]) {
    const orders = this.orders.length
      ? this.orders
      : [{ column: "created_at" as const, ascending: false }];

    return records.toSorted((a, b) => {
      for (const order of orders) {
        const aValue = a[order.column];
        const bValue = b[order.column];

        if (aValue == null && bValue != null) {
          return order.nullsFirst ? -1 : 1;
        }
        if (aValue != null && bValue == null) {
          return order.nullsFirst ? 1 : -1;
        }
        if (aValue == null && bValue == null) continue;

        const comparison =
          typeof aValue === "number" && typeof bValue === "number"
            ? aValue - bValue
            : String(aValue).localeCompare(String(bValue));

        if (comparison !== 0) {
          return order.ascending ? comparison : -comparison;
        }
      }

      return 0;
    });
  }

  private matchesSearchTerm(record: FlintRecord) {
    if (!this.searchTerm) return true;

    return [record.title, record.summary, record.when, record.where, record.type]
      .filter((value): value is string => typeof value === "string")
      .some((value) => value.toLowerCase().includes(this.searchTerm ?? ""));
  }
}

class FakeFlintSupabaseClient implements FlintSupabaseClient {
  readonly records: FlintRecord[] = [];

  from(relation: "records") {
    assert.equal(relation, "records");

    return {
      delete: () => new FakeRecordsRequest(this.records, "delete"),
      insert: (values: RecordInsert) =>
        new FakeRecordsRequest(this.records, "insert", values),
      select: () => new FakeRecordsRequest(this.records, "select"),
      update: (values: RecordUpdate) =>
        new FakeRecordsRequest(this.records, "update", values),
    };
  }
}

describe("Flint record year search", () => {
  it("persists compound fuzzy ranges on create and finds overlapping year queries", async () => {
    const supabase = new FakeFlintSupabaseClient();
    const record = await createFlintRecord(supabase, "user-1", {
      type: "event",
      title: "Range record",
      when: "late 1800s to mid 1900s",
    });

    assert.equal(record.start_year, 1871);
    assert.equal(record.end_year, 1970);

    for (const query of [
      "1889",
      "1890",
      "1890s",
      "1900",
      "1900s",
      "1901",
      "1910s",
      "early 1900s",
      "1925",
      "mid 1900s",
      "1970",
    ]) {
      const results = await searchFlintRecords(supabase, "user-1", query);
      assert.deepEqual(
        results.map((result) => result.id),
        [record.id],
        `expected ${query} to overlap the record's parsed range`,
      );
    }

    for (const query of ["1870", "1971", "1700s", "late 2000s"]) {
      const results = await searchFlintRecords(supabase, "user-1", query);
      assert.deepEqual(
        results.map((result) => result.id),
        [],
        `expected ${query} not to overlap the record's parsed range`,
      );
    }
  });

  it("recomputes persisted year ranges when the when value is updated", async () => {
    const supabase = new FakeFlintSupabaseClient();
    const record = await createFlintRecord(supabase, "user-1", {
      type: "event",
      title: "Update range record",
      when: "late 1800s",
    });

    const updated = await updateFlintRecord(supabase, "user-1", record.id, {
      when: "mid 1900s",
    });

    assert.equal(updated.start_year, 1931);
    assert.equal(updated.end_year, 1970);
  });

  it("lists records in canonical timeline order with undated created_at fallback", async () => {
    const supabase = new FakeFlintSupabaseClient();

    await createFlintRecord(supabase, "user-1", {
      type: "event",
      title: "1925 exact",
      when: "1925",
    });
    await createFlintRecord(supabase, "user-1", {
      type: "event",
      title: "1910s decade",
      when: "1910s",
    });
    await createFlintRecord(supabase, "user-1", {
      type: "event",
      title: "Undated newer",
      when: "sometime",
    });
    await createFlintRecord(supabase, "user-1", {
      type: "event",
      title: "Range",
      when: "late 1800s to mid 1900s",
    });
    await createFlintRecord(supabase, "user-1", {
      type: "event",
      title: "Undated newest",
    });

    const records = await listFlintRecordsByYear(supabase, "user-1");

    assert.deepEqual(
      records.map((result) => result.title),
      [
        "Range",
        "1910s decade",
        "1925 exact",
        "Undated newest",
        "Undated newer",
      ],
    );
  });
});

describe("Flint record deletion", () => {
  it("deletes only records owned by the supplied user", async () => {
    const supabase = new FakeFlintSupabaseClient();
    const owned = await createFlintRecord(supabase, "user-1", {
      type: "note",
      title: "Owned record",
    });
    const other = await createFlintRecord(supabase, "user-2", {
      type: "note",
      title: "Other record",
    });

    await deleteFlintRecord(supabase, "user-1", owned.id);

    assert.deepEqual(
      supabase.records.map((record) => record.id),
      [other.id],
    );
  });

  it("does not delete another user's matching record id", async () => {
    const supabase = new FakeFlintSupabaseClient();
    const other = await createFlintRecord(supabase, "user-2", {
      type: "note",
      title: "Other record",
    });

    await deleteFlintRecord(supabase, "user-1", other.id);

    assert.deepEqual(
      supabase.records.map((record) => record.id),
      [other.id],
    );
  });
});
