-- Forward-only safety migration for databases where public.records already exists.
-- Do not recreate or drop public.records; only enforce authenticated user ownership.

alter table public.records
  add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_attribute as a
    join pg_attrdef as d
      on d.adrelid = a.attrelid
     and d.adnum = a.attnum
    where a.attrelid = 'public.records'::regclass
      and a.attname = 'user_id'
      and not a.attisdropped
      and pg_get_expr(d.adbin, d.adrelid) in ('auth.uid()', '(auth.uid())')
  ) then
    alter table public.records
      alter column user_id set default auth.uid();
  end if;
end;
$$;

create index if not exists records_user_id_idx on public.records (user_id);

-- Add the ownership foreign key only if it is not already present. Use NOT VALID so
-- existing user data is not rewritten or rejected during this safety migration.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'records_user_id_fkey'
      and conrelid = 'public.records'::regclass
  ) then
    alter table public.records
      add constraint records_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade
      not valid;
  end if;
end;
$$;

-- Strengthen the column only when the existing data already satisfies it. If any
-- legacy rows have a null owner, leave them intact; RLS below keeps them hidden
-- from authenticated users until an owner is assigned deliberately.
do $$
begin
  if not exists (
    select 1
    from pg_attribute
    where attrelid = 'public.records'::regclass
      and attname = 'user_id'
      and attnotnull
      and not attisdropped
  ) and not exists (select 1 from public.records where user_id is null) then
    alter table public.records
      alter column user_id set not null;
  end if;
end;
$$;

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
