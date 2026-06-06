export interface FlintYearRange {
  startYear: number;
  endYear: number;
}

const YEAR_PATTERN = "([1-9][0-9]{0,3})";
const EXACT_YEAR_RE = new RegExp(`^${YEAR_PATTERN}$`);
const DECADE_RE = new RegExp(`^([1-9][0-9]{2})0s$`, "i");
const CENTURY_STYLE_RE = /^(early|mid|late)\s+([1-9][0-9]{1})00s$/i;
const EXPLICIT_RANGE_RE = new RegExp(
  `^${YEAR_PATTERN}\\s*[-–]\\s*${YEAR_PATTERN}$`,
);

function isSupportedYear(year: number) {
  return Number.isInteger(year) && year >= 1 && year <= 9999;
}

function yearRange(startYear: number, endYear: number): FlintYearRange | null {
  if (
    !isSupportedYear(startYear) ||
    !isSupportedYear(endYear) ||
    startYear > endYear
  ) {
    return null;
  }

  return { startYear, endYear };
}

export function parseFlintYearRange(value: string): FlintYearRange | null {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;

  const exactYearMatch = normalized.match(EXACT_YEAR_RE);
  if (exactYearMatch) {
    const year = Number(exactYearMatch[1]);
    return yearRange(year, year);
  }

  const decadeMatch = normalized.match(DECADE_RE);
  if (decadeMatch) {
    const startYear = Number(`${decadeMatch[1]}0`);
    return yearRange(startYear, startYear + 9);
  }

  const centuryStyleMatch = normalized.match(CENTURY_STYLE_RE);
  if (centuryStyleMatch) {
    const label = centuryStyleMatch[1].toLowerCase();
    const centuryStart = Number(`${centuryStyleMatch[2]}00`);

    if (label === "early") return yearRange(centuryStart, centuryStart + 30);
    if (label === "mid") return yearRange(centuryStart + 31, centuryStart + 70);
    return yearRange(centuryStart + 71, centuryStart + 99);
  }

  const explicitRangeMatch = normalized.match(EXPLICIT_RANGE_RE);
  if (explicitRangeMatch) {
    return yearRange(Number(explicitRangeMatch[1]), Number(explicitRangeMatch[2]));
  }

  return null;
}
