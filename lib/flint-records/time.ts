export interface FlintYearRange {
  startYear: number;
  endYear: number;
}

const YEAR_PATTERN = "([1-9][0-9]{0,3})";
const YEAR_OR_PERIOD_PATTERN = "([1-9][0-9]{0,3}s?)";
const LEFT_BOUNDARY = "(?<![0-9A-Za-z])";
const RIGHT_BOUNDARY = "(?![0-9A-Za-z])";
const EXACT_YEAR_RE = new RegExp(
  `${LEFT_BOUNDARY}${YEAR_PATTERN}${RIGHT_BOUNDARY}`,
);
const PERIOD_RE = new RegExp(
  `${LEFT_BOUNDARY}([1-9][0-9]{0,3})s${RIGHT_BOUNDARY}`,
  "i",
);
const CENTURY_STYLE_RE = new RegExp(
  `${LEFT_BOUNDARY}(early|mid|late)\\s+([1-9][0-9]{0,3})s${RIGHT_BOUNDARY}`,
  "i",
);
const RANGE_RE = new RegExp(
  `${LEFT_BOUNDARY}${YEAR_OR_PERIOD_PATTERN}\\s*(?:[-–—]|to)\\s*${YEAR_OR_PERIOD_PATTERN}${RIGHT_BOUNDARY}`,
  "i",
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

function periodRange(period: string): FlintYearRange | null {
  const startYear = Number(period);

  if (!isSupportedYear(startYear) || startYear % 10 !== 0) {
    return null;
  }

  const span = startYear % 100 === 0 ? 99 : 9;
  return yearRange(startYear, startYear + span);
}

function rangeEndpoint(token: string, endpoint: "start" | "end"): number | null {
  if (!token.toLowerCase().endsWith("s")) {
    const year = Number(token);
    return isSupportedYear(year) ? year : null;
  }

  const range = periodRange(token.slice(0, -1));
  if (!range) return null;

  return endpoint === "start" ? range.startYear : range.endYear;
}

export function parseFlintYearRange(value: string): FlintYearRange | null {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;

  const rangeMatch = normalized.match(RANGE_RE);
  if (rangeMatch) {
    const startYear = rangeEndpoint(rangeMatch[1], "start");
    const endYear = rangeEndpoint(rangeMatch[2], "end");

    if (startYear !== null && endYear !== null) {
      const range = yearRange(startYear, endYear);
      if (range) return range;
    }
  }

  const centuryStyleMatch = normalized.match(CENTURY_STYLE_RE);
  if (centuryStyleMatch) {
    const label = centuryStyleMatch[1].toLowerCase();
    const period = periodRange(centuryStyleMatch[2]);

    if (period && period.startYear % 100 === 0 && period.endYear % 100 === 99) {
      if (label === "early") {
        return yearRange(period.startYear, period.startYear + 30);
      }

      if (label === "mid") {
        return yearRange(period.startYear + 31, period.startYear + 70);
      }

      return yearRange(period.startYear + 71, period.startYear + 99);
    }
  }

  const periodMatch = normalized.match(PERIOD_RE);
  if (periodMatch) {
    const range = periodRange(periodMatch[1]);
    if (range) return range;
  }

  const exactYearMatch = normalized.match(EXACT_YEAR_RE);
  if (exactYearMatch) {
    const year = Number(exactYearMatch[1]);
    return yearRange(year, year);
  }

  return null;
}
