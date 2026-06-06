create table public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  summary text,
  "when" text,
  "where" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint records_type_check check (
    type in ('person', 'event', 'place', 'object', 'note')
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
create index records_created_at_idx on public.records (created_at desc);
create index records_type_idx on public.records (type);

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
