-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create 'branches' table
create table branches (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create 'profiles' table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('admin', 'manager', 'staff')) default 'staff',
  branch_id uuid references branches(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS on new tables
alter table branches enable row level security;
alter table profiles enable row level security;

-- 5. Create default 'Main Branch' (for legacy data migration)
insert into branches (name, slug)
values ('Merkez Şube', 'merkez')
on conflict (slug) do nothing;

-- 6. Add 'branch_id' to existing tables (records)
-- We assume 'records' table exists. If not, this will fail, but assuming it does from context.
alter table records 
add column if not exists branch_id uuid references branches(id);

-- 7. Update existing records to belong to Main Branch (Migration)
do $$
declare
  main_branch_id uuid;
begin
  select id into main_branch_id from branches where slug = 'merkez' limit 1;
  
  if main_branch_id is not null then
    update records set branch_id = main_branch_id where branch_id is null;
  end if;
end $$;

-- 8. RLS Policies

-- Profiles: Users can see their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Profiles: Super Admins (null branch_id or specific role) can see all
-- For simplicity, let's assume if you have a profile, you can read your own branch info.

-- Records: Users can only see records from their branch
create policy "Tenant Isolation: View Records" on records
  for select
  using (
    branch_id in (
      select branch_id from profiles where id = auth.uid()
    )
  );

create policy "Tenant Isolation: Insert Records" on records
  for insert
  with check (
    branch_id in (
      select branch_id from profiles where id = auth.uid()
    )
  );

create policy "Tenant Isolation: Update Records" on records
  for update
  using (
    branch_id in (
      select branch_id from profiles where id = auth.uid()
    )
  );

create policy "Tenant Isolation: Delete Records" on records
  for delete
  using (
    branch_id in (
      select branch_id from profiles where id = auth.uid()
    )
  );

-- Trigger to create profile on signup (Optional, but good for automation)
-- This requires a function.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, branch_id)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    'manager', -- Default to manager for now for easy onboarding
    (select id from branches where slug = 'merkez' limit 1) -- Auto-assign to Merkez for now
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger logic is tricky to deploy via simple script if triggers already exist, 
-- but this is the standard way.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
