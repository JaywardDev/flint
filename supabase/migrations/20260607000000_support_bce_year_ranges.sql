-- Minimal Flint V1 CE/BCE/AD/BC support for derived numeric year ranges.
-- Human-facing records.when remains unchanged; start_year/end_year use an
-- astronomical-style internal convention where 0 means historical 1 BCE.

alter table public.records
  drop constraint if exists records_year_range_check;

alter table public.records
  add constraint records_year_range_check check (
    (start_year is null and end_year is null)
    or (
      start_year is not null
      and end_year is not null
      and start_year <= end_year
      and start_year >= -9998
      and end_year <= 9999
    )
  );

comment on column public.records.start_year is
  'Derived internal year for search/timeline ordering. Astronomical-style convention: 0 means historical 1 BCE and is never displayed to users as year zero.';

comment on column public.records.end_year is
  'Derived internal year for search/timeline ordering. Astronomical-style convention: 0 means historical 1 BCE and is never displayed to users as year zero.';

create or replace function public.parse_flint_year_endpoint(value text)
returns table(parsed_start_year integer, parsed_end_year integer)
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized text;
  matches text[];
  part text;
  year_value integer;
  era text;
  base_start_year integer;
  base_end_year integer;
begin
  parsed_start_year := null;
  parsed_end_year := null;

  normalized := lower(trim(regexp_replace(coalesce(value, ''), '[[:space:]]+', ' ', 'g')));
  if normalized = '' then
    return next;
    return;
  end if;

  matches := regexp_match(normalized, '^([1-9][0-9]{0,3})[[:space:]]+(bce|bc|ce|ad)$');
  if matches is not null then
    year_value := matches[1]::integer;
    era := matches[2];

    if era in ('bce', 'bc') then
      year_value := 1 - year_value;
    end if;

    parsed_start_year := year_value;
    parsed_end_year := year_value;
    return next;
    return;
  end if;

  matches := regexp_match(normalized, '^([1-9][0-9]{0,3})$');
  if matches is not null then
    year_value := matches[1]::integer;
    parsed_start_year := year_value;
    parsed_end_year := year_value;
    return next;
    return;
  end if;

  matches := regexp_match(normalized, '^(?:(early|mid|late)[[:space:]]+)?([1-9][0-9]{0,3})s$');
  if matches is not null then
    part := matches[1];
    base_start_year := matches[2]::integer;

    if base_start_year between 1 and 9999 and base_start_year % 10 = 0 then
      if base_start_year % 100 = 0 then
        base_end_year := base_start_year + 99;
      else
        base_end_year := base_start_year + 9;
      end if;

      if base_end_year <= 9999 then
        if part is null then
          parsed_start_year := base_start_year;
          parsed_end_year := base_end_year;
        elsif base_end_year - base_start_year = 99 and part = 'early' then
          parsed_start_year := base_start_year;
          parsed_end_year := base_start_year + 30;
        elsif base_end_year - base_start_year = 99 and part = 'mid' then
          parsed_start_year := base_start_year + 31;
          parsed_end_year := base_start_year + 70;
        elsif base_end_year - base_start_year = 99 and part = 'late' then
          parsed_start_year := base_start_year + 71;
          parsed_end_year := base_start_year + 99;
        end if;
      end if;
    end if;

    return next;
    return;
  end if;

  matches := regexp_match(
    normalized,
    '^(?:(early|mid|late)[[:space:]]+)?([1-9][0-9]{0,1})(?:st|nd|rd|th)[[:space:]]+century[[:space:]]+(bce|bc|ce|ad)$'
  );
  if matches is not null then
    part := matches[1];
    year_value := matches[2]::integer;
    era := matches[3];

    if era in ('bce', 'bc') then
      base_start_year := 1 - year_value * 100;
      base_end_year := 100 - year_value * 100;
    else
      base_start_year := case when year_value = 1 then 1 else (year_value - 1) * 100 end;
      base_end_year := year_value * 100 - 1;
    end if;

    if base_start_year between -9998 and 9999 and base_end_year between -9998 and 9999 then
      if part is null then
        parsed_start_year := base_start_year;
        parsed_end_year := base_end_year;
      elsif base_end_year - base_start_year in (98, 99) and part = 'early' then
        parsed_start_year := base_start_year;
        parsed_end_year := base_start_year + 30;
      elsif base_end_year - base_start_year in (98, 99) and part = 'mid' then
        parsed_start_year := base_start_year + 31;
        parsed_end_year := base_start_year + 70;
      elsif base_end_year - base_start_year in (98, 99) and part = 'late' then
        parsed_start_year := base_start_year + 71;
        parsed_end_year := base_end_year;
      end if;
    end if;

    return next;
    return;
  end if;

  matches := regexp_match(
    normalized,
    '^(?:(early|mid|late)[[:space:]]+)?([1-9][0-9]{0,1})(?:st|nd|rd|th)[[:space:]]+century$'
  );
  if matches is not null then
    part := matches[1];
    year_value := matches[2]::integer;
    base_start_year := case when year_value = 1 then 1 else (year_value - 1) * 100 end;
    base_end_year := year_value * 100 - 1;

    if base_start_year between 1 and 9999 and base_end_year between 1 and 9999 then
      if part is null then
        parsed_start_year := base_start_year;
        parsed_end_year := base_end_year;
      elsif base_end_year - base_start_year in (98, 99) and part = 'early' then
        parsed_start_year := base_start_year;
        parsed_end_year := base_start_year + 30;
      elsif base_end_year - base_start_year in (98, 99) and part = 'mid' then
        parsed_start_year := base_start_year + 31;
        parsed_end_year := base_start_year + 70;
      elsif base_end_year - base_start_year in (98, 99) and part = 'late' then
        parsed_start_year := base_start_year + 71;
        parsed_end_year := base_end_year;
      end if;
    end if;

    return next;
    return;
  end if;

  return next;
end;
$$;

create or replace function public.parse_flint_year_range(value text)
returns table(parsed_start_year integer, parsed_end_year integer)
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized text;
  matches text[];
  left_endpoint record;
  right_endpoint record;
  whole_endpoint record;
begin
  parsed_start_year := null;
  parsed_end_year := null;

  normalized := trim(regexp_replace(coalesce(value, ''), '[[:space:]]+', ' ', 'g'));
  if normalized = '' then
    return next;
    return;
  end if;

  matches := regexp_match(normalized, '^(.+?)(?:[[:space:]]+to[[:space:]]+|[[:space:]]*[-–—][[:space:]]*)(.+)$', 'i');
  if matches is not null then
    select * into left_endpoint from public.parse_flint_year_endpoint(matches[1]);
    select * into right_endpoint from public.parse_flint_year_endpoint(matches[2]);

    if left_endpoint.parsed_start_year is not null
      and right_endpoint.parsed_end_year is not null
      and left_endpoint.parsed_start_year <= right_endpoint.parsed_end_year
    then
      parsed_start_year := left_endpoint.parsed_start_year;
      parsed_end_year := right_endpoint.parsed_end_year;
      return next;
      return;
    end if;
  end if;

  select * into whole_endpoint from public.parse_flint_year_endpoint(normalized);
  if whole_endpoint.parsed_start_year is not null then
    parsed_start_year := whole_endpoint.parsed_start_year;
    parsed_end_year := whole_endpoint.parsed_end_year;
    return next;
    return;
  end if;

  if regexp_match(lower(normalized), '(^|[^[:alpha:]])(b\.?c\.?(e\.?)?|a\.?d\.?|c\.?e\.?)([^[:alpha:]]|$)') is not null then
    return next;
    return;
  end if;

  matches := regexp_match(
    normalized,
    '(?:^|[^0-9A-Za-z])(early|mid|late)[[:space:]]+([1-9][0-9]{0,3})s(?:$|[^0-9A-Za-z])',
    'i'
  );
  if matches is not null then
    select * into whole_endpoint
    from public.parse_flint_year_endpoint(matches[1] || ' ' || matches[2] || 's');

    if whole_endpoint.parsed_start_year is not null then
      parsed_start_year := whole_endpoint.parsed_start_year;
      parsed_end_year := whole_endpoint.parsed_end_year;
      return next;
      return;
    end if;
  end if;

  matches := regexp_match(
    normalized,
    '(?:^|[^0-9A-Za-z])([1-9][0-9]{0,3})s(?:$|[^0-9A-Za-z])',
    'i'
  );
  if matches is not null then
    select * into whole_endpoint from public.parse_flint_year_endpoint(matches[1] || 's');

    if whole_endpoint.parsed_start_year is not null then
      parsed_start_year := whole_endpoint.parsed_start_year;
      parsed_end_year := whole_endpoint.parsed_end_year;
      return next;
      return;
    end if;
  end if;

  matches := regexp_match(
    normalized,
    '(?:^|[^0-9A-Za-z])([1-9][0-9]{0,3})(?:$|[^0-9A-Za-z])'
  );
  if matches is not null then
    select * into whole_endpoint from public.parse_flint_year_endpoint(matches[1]);

    if whole_endpoint.parsed_start_year is not null then
      parsed_start_year := whole_endpoint.parsed_start_year;
      parsed_end_year := whole_endpoint.parsed_end_year;
      return next;
      return;
    end if;
  end if;

  return next;
end;
$$;

with parsed_records as (
  select
    records.id,
    parsed.parsed_start_year,
    parsed.parsed_end_year
  from public.records
  cross join lateral public.parse_flint_year_range(records."when") as parsed
)
update public.records as records
set
  start_year = parsed_records.parsed_start_year,
  end_year = parsed_records.parsed_end_year
from parsed_records
where records.id = parsed_records.id
  and (
    records.start_year is distinct from parsed_records.parsed_start_year
    or records.end_year is distinct from parsed_records.parsed_end_year
  );

-- Manual verification after applying this migration:
-- select * from public.parse_flint_year_range('44 BCE');              -- -43, -43
-- select * from public.parse_flint_year_range('500 BCE to 300 BCE'); -- -499, -299
-- select * from public.parse_flint_year_range('300 BCE to 100 CE');  -- -299, 100
-- select * from public.parse_flint_year_range('1 BCE to 1 CE');      -- 0, 1
-- select * from public.parse_flint_year_range('early 1st century BCE'); -- -99, -69
-- select * from public.parse_flint_year_range('mid 1st century CE'); -- 32, 71
