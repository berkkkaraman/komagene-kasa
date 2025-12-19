-- 1. Enable RLS (Ensure it's on)
alter table branches enable row level security;
alter table profiles enable row level security;

-- 2. BRANCHES Policy
-- Everyone with a profile can view branches (needed for dropdowns etc, or at least their own)
-- But for now, let's allow authenticated users to view all branches (simple multi-tenant list) 
-- OR strictly: Admins view all, Manager views own.
-- Let's go with: Authenticated users can read branches (names are usually public info in a company)
drop policy if exists "Authenticated read branches" on branches;
create policy "Authenticated read branches" on branches
  for select using (auth.role() = 'authenticated');

-- Admins can insert/update/delete branches
drop policy if exists "Admins manage branches" on branches;
create policy "Admins manage branches" on branches
  for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. PROFILES Policy
-- Admins can view/edit all profiles
drop policy if exists "Admins manage profiles" on profiles;
create policy "Admins manage profiles" on profiles
  for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Manager can view staff in their branch (Optional, skipping for now to keep simple)
-- Users can still view their own profile (existing policy)

-- 4. RECORDS Policy Update (Super View)
-- Admins should see ALL records.
drop policy if exists "Tenant Isolation: View Records" on records;
create policy "Tenant Isolation: View Records" on records
  for select
  using (
    ( -- User matches branch
      branch_id in (select branch_id from profiles where id = auth.uid())
    ) 
    OR 
    ( -- User is Admin
      exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );

-- 5. HELPER: Make me Admin (The user running this script becomes admin)
-- Since we are running this in SQL Editor as superuser, we can bypass RLS to update.
update profiles 
set role = 'admin'
where id = auth.uid(); 
-- Caution: auth.uid() works in context of a request. In SQL Editor it might be null.
-- So we need to be clever. We can't easily know WHICH user is you in SQL Editor.
-- We will instruct user to find their ID or just update ALL managers to admin if they want.
-- Or better: "Update the profile with email X to admin"

-- Let's purely set policies here.
