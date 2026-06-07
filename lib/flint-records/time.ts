export interface FlintYearRange {
  startYear: number;
  endYear: number;
}

type FlintYearRangePart = "early" | "mid" | "late";
type FlintEra = "bce" | "bc" | "ce" | "ad";

const YEAR_PATTERN = "([1-9][0-9]{0,3})";
const YEAR_OR_PERIOD_PATTERN = "([1-9][0-9]{0,3}s?)";
const ERA_PATTERN = "(bce|bc|ce|ad)";
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
const COMPOUND_RANGE_RE = /^(.+?)\s*(?:[-–—]|\bto\b)\s*(.+)$/i;
const ENDPOINT_YEAR_RE = /^([1-9][0-9]{0,3})$/;
const ENDPOINT_ERA_YEAR_RE = new RegExp(
  `^${YEAR_PATTERN}\\s+${ERA_PATTERN}$`,
  "i",
);
const ENDPOINT_PERIOD_RE = /^(?:(early|mid|late)\s+)?([1-9][0-9]{0,3})s$/i;
const ENDPOINT_CENTURY_RE =
  /^(?:(early|mid|late)\s+)?([1-9][0-9]{0,1})(?:st|nd|rd|th)\s+century$/i;
const ENDPOINT_ERA_CENTURY_RE = new RegExp(
  `^(?:(early|mid|late)\\s+)?([1-9][0-9]{0,1})(?:st|nd|rd|th)\\s+century\\s+${ERA_PATTERN}$`,
  "i",
);
const ERA_MARKER_LIKE_RE =
  /(^|[^A-Za-z])(?:b\.?c\.?(?:e\.?)?|a\.?d\.?|c\.?e\.?)(?=$|[^A-Za-z])/i;

function isSupportedYear(year: number) {
  return Number.isInteger(year) && year >= -9998 && year <= 9999;
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

function eraYear(year: string, era: string): number | null {
  const yearNumber = Number(year);
  if (!Number.isInteger(yearNumber) || yearNumber < 1 || yearNumber > 9999) {
    return null;
  }

  const normalizedEra = era.toLowerCase() as FlintEra;
  if (normalizedEra === "bce" || normalizedEra === "bc") {
    return 1 - yearNumber;
  }

  return yearNumber;
}

function periodRange(period: string): FlintYearRange | null {
  const startYear = Number(period);

  if (!isSupportedYear(startYear) || startYear % 10 !== 0) {
    return null;
  }

  const span = startYear % 100 === 0 ? 99 : 9;
  return yearRange(startYear, startYear + span);
}

function centuryRange(century: string): FlintYearRange | null {
  const centuryNumber = Number(century);
  if (!Number.isInteger(centuryNumber) || centuryNumber < 1) return null;

  const startYear = centuryNumber === 1 ? 1 : (centuryNumber - 1) * 100;
  const endYear = centuryNumber * 100 - 1;
  return yearRange(startYear, endYear);
}

function eraCenturyRange(century: string, era: string): FlintYearRange | null {
  const centuryNumber = Number(century);
  if (!Number.isInteger(centuryNumber) || centuryNumber < 1) return null;

  const normalizedEra = era.toLowerCase() as FlintEra;
  if (normalizedEra === "bce" || normalizedEra === "bc") {
    return yearRange(1 - centuryNumber * 100, 100 - centuryNumber * 100);
  }

  return centuryRange(century);
}

function centuryPartRange(
  range: FlintYearRange,
  part: FlintYearRangePart | null,
): FlintYearRange | null {
  if (!part) return range;

  const centurySpan = range.endYear - range.startYear;
  if (centurySpan !== 99 && centurySpan !== 98) return null;

  if (part === "early") {
    return yearRange(range.startYear, range.startYear + 30);
  }

  if (part === "mid") {
    return yearRange(range.startYear + 31, range.startYear + 70);
  }

  return yearRange(range.startYear + 71, range.endYear);
}

function rangeEndpoint(token: string, endpoint: "start" | "end"): number | null {
  const range = parseRangeEndpoint(token);
  if (!range) return null;

  return endpoint === "start" ? range.startYear : range.endYear;
}

function normalizePart(part: string | undefined): FlintYearRangePart | null {
  const normalized = part?.toLowerCase();
  if (
    normalized === "early" ||
    normalized === "mid" ||
    normalized === "late"
  ) {
    return normalized;
  }

  return null;
}

function parseRangeEndpoint(token: string): FlintYearRange | null {
  const normalized = token.trim().replace(/\s+/g, " ");

  const eraYearMatch = normalized.match(ENDPOINT_ERA_YEAR_RE);
  if (eraYearMatch) {
    const year = eraYear(eraYearMatch[1], eraYearMatch[2]);
    return year === null ? null : yearRange(year, year);
  }

  const yearMatch = normalized.match(ENDPOINT_YEAR_RE);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    return yearRange(year, year);
  }

  const periodMatch = normalized.match(ENDPOINT_PERIOD_RE);
  if (periodMatch) {
    const range = periodRange(periodMatch[2]);
    return range ? centuryPartRange(range, normalizePart(periodMatch[1])) : null;
  }

  const eraCenturyMatch = normalized.match(ENDPOINT_ERA_CENTURY_RE);
  if (eraCenturyMatch) {
    const range = eraCenturyRange(eraCenturyMatch[2], eraCenturyMatch[3]);
    return range
      ? centuryPartRange(range, normalizePart(eraCenturyMatch[1]))
      : null;
  }

  const centuryMatch = normalized.match(ENDPOINT_CENTURY_RE);
  if (centuryMatch) {
    const range = centuryRange(centuryMatch[2]);
    return range ? centuryPartRange(range, normalizePart(centuryMatch[1])) : null;
  }

  return null;
}

export function parseFlintYearRange(value: string): FlintYearRange | null {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;

  const compoundRangeMatch = normalized.match(COMPOUND_RANGE_RE);
  if (compoundRangeMatch) {
    const startYear = rangeEndpoint(compoundRangeMatch[1], "start");
    const endYear = rangeEndpoint(compoundRangeMatch[2], "end");

    if (startYear !== null && endYear !== null) {
      const range = yearRange(startYear, endYear);
      if (range) return range;
    }
  }

  const rangeMatch = normalized.match(RANGE_RE);
  if (rangeMatch) {
    const startYear = rangeEndpoint(rangeMatch[1], "start");
    const endYear = rangeEndpoint(rangeMatch[2], "end");

    if (startYear !== null && endYear !== null) {
      const range = yearRange(startYear, endYear);
      if (range) return range;
    }
  }

  const wholeEndpointRange = parseRangeEndpoint(normalized);
  if (wholeEndpointRange) return wholeEndpointRange;

  if (ERA_MARKER_LIKE_RE.test(normalized)) return null;

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
