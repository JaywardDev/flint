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

  it("parses approved exact suffix era years", () => {
    for (const value of ["44 BCE", "44 bce", "44 BC", "44 bc"]) {
      assert.deepEqual(parseFlintYearRange(value), {
        startYear: -43,
        endYear: -43,
      });
    }

    for (const value of ["476 CE", "476 ce", "476 AD", "476 ad"]) {
      assert.deepEqual(parseFlintYearRange(value), {
        startYear: 476,
        endYear: 476,
      });
    }
  });

  it("keeps 1 BCE immediately before 1 CE internally", () => {
    assert.deepEqual(parseFlintYearRange("1 BCE"), {
      startYear: 0,
      endYear: 0,
    });
    assert.deepEqual(parseFlintYearRange("1 CE"), {
      startYear: 1,
      endYear: 1,
    });
  });

  it("parses approved suffix era ranges", () => {
    assert.deepEqual(parseFlintYearRange("500 BCE to 300 BCE"), {
      startYear: -499,
      endYear: -299,
    });
    assert.deepEqual(parseFlintYearRange("300 BCE to 100 CE"), {
      startYear: -299,
      endYear: 100,
    });
    assert.deepEqual(parseFlintYearRange("44 BCE to 14 CE"), {
      startYear: -43,
      endYear: 14,
    });
    assert.deepEqual(parseFlintYearRange("100 BC to 50 AD"), {
      startYear: -99,
      endYear: 50,
    });
    assert.deepEqual(parseFlintYearRange("1 BCE to 1 CE"), {
      startYear: 0,
      endYear: 1,
    });
    assert.deepEqual(parseFlintYearRange("500 bce to 300 bce"), {
      startYear: -499,
      endYear: -299,
    });
    assert.deepEqual(parseFlintYearRange("500 BCE - 300 BCE"), {
      startYear: -499,
      endYear: -299,
    });
    assert.deepEqual(parseFlintYearRange("500 BCE – 300 BCE"), {
      startYear: -499,
      endYear: -299,
    });
  });

  it("intentionally leaves unsupported era forms unparsed", () => {
    for (const value of [
      "BCE 44",
      "AD 476",
      "44 B.C.",
      "476 A.D.",
      "circa 44 BCE",
      "around 300 BCE",
      "100 BC - AD 50",
    ]) {
      assert.equal(parseFlintYearRange(value), null, value);
    }
  });

  it("parses approved fuzzy ordinal centuries with suffix era markers", () => {
    assert.deepEqual(parseFlintYearRange("early 1st century BCE"), {
      startYear: -99,
      endYear: -69,
    });
    assert.deepEqual(parseFlintYearRange("late 2nd century BCE"), {
      startYear: -128,
      endYear: -100,
    });
    assert.deepEqual(parseFlintYearRange("mid 1st century CE"), {
      startYear: 32,
      endYear: 71,
    });
    assert.deepEqual(parseFlintYearRange("early 1st century bce"), {
      startYear: -99,
      endYear: -69,
    });
    assert.deepEqual(parseFlintYearRange("mid 1st century ce"), {
      startYear: 32,
      endYear: 71,
    });
  });
});
