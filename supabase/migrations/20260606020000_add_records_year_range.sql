-- Forward-only V1 year range search support.
-- Human-facing time stays in records.when; numeric CE year ranges are optional.

alter table public.records
  add column start_year integer null,
  add column end_year integer null;

alter table public.records
  add constraint records_year_range_check check (
    (start_year is null and end_year is null)
    or (
      start_year is not null
      and end_year is not null
      and start_year <= end_year
      and start_year >= 1
      and end_year <= 9999
    )
  );

create index records_user_year_range_idx
on public.records (user_id, start_year, end_year)
where start_year is not null and end_year is not null;
