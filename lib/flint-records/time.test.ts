import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseFlintYearRange } from "./time";

describe("parseFlintYearRange", () => {
  it("parses compound fuzzy ranges that span centuries", () => {
    assert.deepEqual(parseFlintYearRange("late 1800s to mid 1900s"), {
      startYear: 1871,
      endYear: 1970,
    });
  });

  it("parses exact year search terms as single-year ranges", () => {
    assert.deepEqual(parseFlintYearRange("1901"), {
      startYear: 1901,
      endYear: 1901,
    });
    assert.deepEqual(parseFlintYearRange("1925"), {
      startYear: 1925,
      endYear: 1925,
    });
  });

  it("supports fuzzy century and period phrases", () => {
    assert.deepEqual(
      parseFlintYearRange("late 18th century to mid 20th century"),
      { startYear: 1771, endYear: 1970 },
    );
    assert.deepEqual(parseFlintYearRange("early 1800s to late 1800s"), {
      startYear: 1800,
      endYear: 1899,
    });
    assert.deepEqual(parseFlintYearRange("1800s"), {
      startYear: 1800,
      endYear: 1899,
    });
    assert.deepEqual(parseFlintYearRange("late 1800s"), {
      startYear: 1871,
      endYear: 1899,
    });
    assert.deepEqual(parseFlintYearRange("1900s"), {
      startYear: 1900,
      endYear: 1999,
    });
    assert.deepEqual(parseFlintYearRange("early 1900s"), {
      startYear: 1900,
      endYear: 1930,
    });
    assert.deepEqual(parseFlintYearRange("mid 1900s"), {
      startYear: 1931,
      endYear: 1970,
    });
    assert.deepEqual(parseFlintYearRange("1910s"), {
      startYear: 1910,
      endYear: 1919,
    });
  });
});
