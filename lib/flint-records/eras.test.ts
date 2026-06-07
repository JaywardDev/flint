import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatFlintTimelineYear,
  groupFlintRecordsByEra,
  sortFlintRecordsForTimeline,
} from "./eras";
import type { FlintRecord } from "./types";

function record(
  id: string,
  when: string | null,
  startYear: number | null,
  endYear: number | null,
  createdAt: string,
): FlintRecord {
  return {
    id,
    user_id: "user-1",
    type: "event",
    title: id,
    summary: null,
    when,
    start_year: startYear,
    end_year: endYear,
    where: null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

describe("Flint timeline ordering and grouping", () => {
  it("sorts dated records by parsed numeric range, not when text or created date", () => {
    const records = [
      record(
        "recently-created-old-range",
        "late 1800s to mid 1900s",
        1871,
        1970,
        "2026-01-04T00:00:00.000Z",
      ),
      record(
        "later-exact-year",
        "1925",
        1925,
        1925,
        "2026-01-03T00:00:00.000Z",
      ),
      record(
        "early-century",
        "early 1900s",
        1900,
        1930,
        "2026-01-02T00:00:00.000Z",
      ),
      record(
        "decade",
        "1910s",
        1910,
        1919,
        "2026-01-01T00:00:00.000Z",
      ),
    ];

    assert.deepEqual(
      sortFlintRecordsForTimeline(records).map((item) => item.id),
      [
        "recently-created-old-range",
        "early-century",
        "decade",
        "later-exact-year",
      ],
    );
  });

  it("keeps records without parsed years in an undated created_at fallback group", () => {
    const records = [
      record(
        "newer-undated",
        "sometime",
        null,
        null,
        "2026-01-03T00:00:00.000Z",
      ),
      record(
        "dated",
        "1910s",
        1910,
        1919,
        "2026-01-02T00:00:00.000Z",
      ),
      record(
        "older-undated",
        null,
        null,
        null,
        "2026-01-01T00:00:00.000Z",
      ),
    ];

    const sorted = sortFlintRecordsForTimeline(records);
    assert.deepEqual(
      sorted.map((item) => item.id),
      ["dated", "newer-undated", "older-undated"],
    );

    const groups = groupFlintRecordsByEra(sorted);
    const contemporary = groups.find((group) => group.id === "contemporary");
    const undated = groups.find((group) => group.id === "undated");

    assert.deepEqual(
      contemporary?.records.map((item) => item.id),
      ["dated"],
    );
    assert.deepEqual(
      undated?.records.map((item) => item.id),
      ["newer-undated", "older-undated"],
    );
  });

  it("sorts mixed BCE and CE records by internal year", () => {
    const records = [
      record("476-ce", "476 CE", 476, 476, "2026-01-05T00:00:00.000Z"),
      record("1-ce", "1 CE", 1, 1, "2026-01-04T00:00:00.000Z"),
      record("1-bce", "1 BCE", 0, 0, "2026-01-03T00:00:00.000Z"),
      record("44-bce", "44 BCE", -43, -43, "2026-01-02T00:00:00.000Z"),
      record("500-bce", "500 BCE", -499, -499, "2026-01-01T00:00:00.000Z"),
    ];

    assert.deepEqual(
      sortFlintRecordsForTimeline(records).map((item) => item.id),
      ["500-bce", "44-bce", "1-bce", "1-ce", "476-ce"],
    );
  });

  it("keeps BCE records dated and sorts crossing ranges by internal start year", () => {
    const records = [
      record("undated", "sometime", null, null, "2026-01-03T00:00:00.000Z"),
      record("crossing", "300 BCE to 100 CE", -299, 100, "2026-01-02T00:00:00.000Z"),
      record("older", "500 BCE to 300 BCE", -499, -299, "2026-01-01T00:00:00.000Z"),
    ];

    const sorted = sortFlintRecordsForTimeline(records);
    assert.deepEqual(
      sorted.map((item) => item.id),
      ["older", "crossing", "undated"],
    );

    const groups = groupFlintRecordsByEra(sorted);
    const ancient = groups.find((group) => group.id === "ancient");
    const undated = groups.find((group) => group.id === "undated");

    assert.deepEqual(
      ancient?.records.map((item) => item.id),
      ["older", "crossing"],
    );
    assert.deepEqual(undated?.records.map((item) => item.id), ["undated"]);
  });

  it("formats timeline rail years without exposing zero or negative internals", () => {
    assert.equal(formatFlintTimelineYear(0), "1 BCE");
    assert.equal(formatFlintTimelineYear(-1), "2 BCE");
    assert.equal(formatFlintTimelineYear(-43), "44 BCE");
    assert.equal(formatFlintTimelineYear(1), "1");
    assert.equal(formatFlintTimelineYear(476), "476");
  });

});
