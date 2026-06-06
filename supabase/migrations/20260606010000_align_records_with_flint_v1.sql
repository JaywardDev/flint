-- Forward-only V1 alignment for the single public.records table.
-- Keep records personal and reduce persisted record fields to Flint V1 only.

alter table public.records
  add column if not exists type text,
  add column if not exists "when" text,
  add column if not exists "where" text;

update public.records
set
  type = coalesce(type, record_type, 'note'),
  "when" = coalesce("when", when_text),
  "where" = coalesce("where", where_text),
  title = coalesce(title, nullif(raw_text, ''), 'Untitled record')
where type is null
  or "when" is null
  or "where" is null
  or title is null;

alter table public.records
  alter column type set default 'note',
  alter column type set not null,
  alter column title set not null;

alter table public.records
  drop constraint if exists records_record_type_check,
  drop constraint if exists records_when_precision_check,
  add constraint records_type_check check (
    type in ('person', 'event', 'place', 'object', 'note')
  );

drop function if exists public.search_records(text);
drop index if exists records_record_type_idx;
drop index if exists records_tags_idx;
drop index if exists records_full_text_search_idx;

alter table public.records
  drop column if exists raw_text,
  drop column if exists why_it_matters,
  drop column if exists record_type,
  drop column if exists when_text,
  drop column if exists when_start,
  drop column if exists when_end,
  drop column if exists when_precision,
  drop column if exists where_text,
  drop column if exists latitude,
  drop column if exists longitude,
  drop column if exists source_text,
  drop column if exists tags;

create index if not exists records_type_idx on public.records (type);

alter table public.records enable row level security;

drop policy if exists "Users can select their own records" on public.records;
drop policy if exists "Users can insert their own records" on public.records;
drop policy if exists "Users can update their own records" on public.records;
drop policy if exists "Users can delete their own records" on public.records;

create policy "Users can select their own records"
on public.records
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own records"
on public.records
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own records"
on public.records
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own records"
on public.records
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.records to authenticated;
revoke all on table public.records from anon;
