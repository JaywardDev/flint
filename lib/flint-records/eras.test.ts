import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { groupFlintRecordsByEra, sortFlintRecordsForTimeline } from "./eras";
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
});
