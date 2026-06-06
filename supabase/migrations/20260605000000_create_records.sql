create table public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  raw_text text not null,
  title text,
  summary text,
  why_it_matters text,
  record_type text,
  when_text text,
  when_start text,
  when_end text,
  when_precision text,
  where_text text,
  latitude numeric,
  longitude numeric,
  source_text text,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint records_record_type_check check (
    record_type is null
    or record_type in ('person', 'event', 'place', 'object', 'note')
  ),
  constraint records_when_precision_check check (
    when_precision is null
    or when_precision in ('exact', 'approximate', 'range', 'era', 'unknown')
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger records_set_updated_at
before update on public.records
for each row
execute function public.set_updated_at();

create index records_user_id_idx on public.records (user_id);
create index records_created_at_idx on public.records (created_at);
create index records_record_type_idx on public.records (record_type);
create index records_tags_idx on public.records using gin (tags);
create index records_full_text_search_idx on public.records using gin (
  to_tsvector(
    'simple'::regconfig,
    coalesce(raw_text, '') || ' ' ||
    coalesce(title, '') || ' ' ||
    coalesce(summary, '') || ' ' ||
    coalesce(why_it_matters, '') || ' ' ||
    coalesce(when_text, '') || ' ' ||
    coalesce(where_text, '') || ' ' ||
    coalesce(source_text, '')
  )
);

alter table public.records enable row level security;

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

create or replace function public.search_records(search_query text)
returns setof public.records
language sql
stable
security invoker
set search_path = ''
as $$
  select records.*
  from public.records as records
  where records.user_id = (select auth.uid())
    and (
      nullif(btrim(search_query), '') is null
      or to_tsvector(
        'simple'::regconfig,
        coalesce(records.raw_text, '') || ' ' ||
        coalesce(records.title, '') || ' ' ||
        coalesce(records.summary, '') || ' ' ||
        coalesce(records.why_it_matters, '') || ' ' ||
        coalesce(records.when_text, '') || ' ' ||
        coalesce(records.where_text, '') || ' ' ||
        coalesce(records.source_text, '')
      ) @@ websearch_to_tsquery('simple'::regconfig, search_query)
    )
  order by records.created_at desc;
$$;

revoke all on function public.search_records(text) from public;
revoke all on function public.search_records(text) from anon;
grant execute on function public.search_records(text) to authenticated;
