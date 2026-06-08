import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatFlintTimelineYear,
  getFlintTimelineDateLabel,
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

function sortedGroups(records: FlintRecord[]) {
  return groupFlintRecordsByEra(sortFlintRecordsForTimeline(records));
}

describe("Flint timeline ordering and grouping", () => {
  it("keeps era sections newest-to-oldest for the rendered timeline list", () => {
    const groups = sortedGroups([]);
    const renderedEraIds = groups
      .filter((group) => group.id !== "undated")
      .map((group) => group.id)
      .reverse();

    assert.deepEqual(renderedEraIds, [
      "contemporary",
      "modern",
      "early-modern",
      "medieval",
      "ancient",
    ]);
  });

  it("sorts dated records by parsed numeric range newest-to-oldest, not when text or created date", () => {
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
        "later-exact-year",
        "decade",
        "early-century",
        "recently-created-old-range",
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

  it("sorts mixed BCE and CE records newest-to-oldest by internal year", () => {
    const records = [
      record("476-ce", "476 CE", 476, 476, "2026-01-05T00:00:00.000Z"),
      record("1-ce", "1 CE", 1, 1, "2026-01-04T00:00:00.000Z"),
      record("1-bce", "1 BCE", 0, 0, "2026-01-03T00:00:00.000Z"),
      record("44-bce", "44 BCE", -43, -43, "2026-01-02T00:00:00.000Z"),
      record("500-bce", "500 BCE", -499, -499, "2026-01-01T00:00:00.000Z"),
    ];

    assert.deepEqual(
      sortFlintRecordsForTimeline(records).map((item) => item.id),
      ["476-ce", "1-ce", "1-bce", "44-bce", "500-bce"],
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
      ["crossing", "older", "undated"],
    );

    const groups = groupFlintRecordsByEra(sorted);
    const ancient = groups.find((group) => group.id === "ancient");
    const undated = groups.find((group) => group.id === "undated");

    assert.deepEqual(
      ancient?.records.map((item) => item.id),
      ["crossing", "older"],
    );
    assert.deepEqual(undated?.records.map((item) => item.id), ["undated"]);
  });

  it("sorts records inside each era newest-to-oldest", () => {
    const groups = sortedGroups([
      record("1914", "1914", 1914, 1914, "2026-01-01T00:00:00.000Z"),
      record("1969", "1969", 1969, 1969, "2026-01-02T00:00:00.000Z"),
      record("1939", "1939", 1939, 1939, "2026-01-03T00:00:00.000Z"),
      record("1701", "1701", 1701, 1701, "2026-01-04T00:00:00.000Z"),
      record("1899", "1899", 1899, 1899, "2026-01-05T00:00:00.000Z"),
    ]);

    assert.deepEqual(
      groups
        .find((group) => group.id === "contemporary")
        ?.records.map((item) => item.id),
      ["1969", "1939", "1914"],
    );
    assert.deepEqual(
      groups
        .find((group) => group.id === "modern")
        ?.records.map((item) => item.id),
      ["1899", "1701"],
    );
  });

  it("orders the Contemporary example with 1969 before 1914", () => {
    const groups = sortedGroups([
      record("wwi", "1914", 1914, 1918, "2026-01-01T00:00:00.000Z"),
      record(
        "great-depression",
        "1929",
        1929,
        1939,
        "2026-01-02T00:00:00.000Z",
      ),
      record("wwii", "1939", 1939, 1945, "2026-01-03T00:00:00.000Z"),
      record("eniac", "1946", 1946, 1946, "2026-01-04T00:00:00.000Z"),
      record(
        "apollo-program",
        "1961",
        1961,
        1972,
        "2026-01-05T00:00:00.000Z",
      ),
      record(
        "moon-landing",
        "1969",
        1969,
        1969,
        "2026-01-06T00:00:00.000Z",
      ),
    ]);

    assert.deepEqual(
      groups
        .find((group) => group.id === "contemporary")
        ?.records.map((item) => item.id),
      [
        "moon-landing",
        "apollo-program",
        "eniac",
        "wwii",
        "great-depression",
        "wwi",
      ],
    );
  });

  it("orders the Ancient World example with 476 before 27 BCE before 2500 BCE", () => {
    const groups = sortedGroups([
      record(
        "abacus",
        "2500 BCE",
        -2499,
        -2499,
        "2026-01-01T00:00:00.000Z",
      ),
      record(
        "roman-empire-rise",
        "27 BCE",
        -26,
        -26,
        "2026-01-02T00:00:00.000Z",
      ),
      record(
        "roman-empire-fall",
        "476",
        476,
        476,
        "2026-01-03T00:00:00.000Z",
      ),
    ]);

    assert.deepEqual(
      groups
        .find((group) => group.id === "ancient")
        ?.records.map((item) => item.id),
      ["roman-empire-fall", "roman-empire-rise", "abacus"],
    );
  });

  it("uses the original when text as the visible label while sorting by start_year", () => {
    const fuzzy = record(
      "fuzzy",
      "late 1800s",
      1871,
      1899,
      "2026-01-01T00:00:00.000Z",
    );
    const later = record(
      "later",
      "1901",
      1901,
      1901,
      "2026-01-02T00:00:00.000Z",
    );

    assert.deepEqual(
      sortFlintRecordsForTimeline([fuzzy, later]).map((item) => item.id),
      ["later", "fuzzy"],
    );
    assert.equal(getFlintTimelineDateLabel(fuzzy), "late 1800s");
  });

  it("uses original range when text as the visible label while sorting by start_year", () => {
    const range = record(
      "range",
      "late 1800s to mid 1900s",
      1871,
      1970,
      "2026-01-01T00:00:00.000Z",
    );
    const later = record(
      "later",
      "1901",
      1901,
      1901,
      "2026-01-02T00:00:00.000Z",
    );

    assert.deepEqual(
      sortFlintRecordsForTimeline([range, later]).map((item) => item.id),
      ["later", "range"],
    );
    assert.equal(getFlintTimelineDateLabel(range), "late 1800s to mid 1900s");
  });

  it("displays BCE labels without exposing internal numeric years", () => {
    const withWhen = record(
      "with-when",
      "2500 BCE",
      -2499,
      -2499,
      "2026-01-01T00:00:00.000Z",
    );
    const withoutWhen = record(
      "without-when",
      null,
      -2499,
      -2499,
      "2026-01-02T00:00:00.000Z",
    );

    assert.equal(getFlintTimelineDateLabel(withWhen), "2500 BCE");
    assert.equal(getFlintTimelineDateLabel(withoutWhen), "2500 BCE");
    assert.notEqual(getFlintTimelineDateLabel(withWhen), "-2499");
    assert.notEqual(getFlintTimelineDateLabel(withoutWhen), "-2499");
  });

  it("formats timeline rail years without exposing zero or negative internals", () => {
    assert.equal(formatFlintTimelineYear(0), "1 BCE");
    assert.equal(formatFlintTimelineYear(-1), "2 BCE");
    assert.equal(formatFlintTimelineYear(-43), "44 BCE");
    assert.equal(formatFlintTimelineYear(1), "1");
    assert.equal(formatFlintTimelineYear(476), "476");
  });
});
