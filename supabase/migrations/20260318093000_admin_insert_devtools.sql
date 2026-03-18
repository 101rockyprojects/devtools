-- Allow authenticated admin user to insert into api.devtools

grant insert on api.devtools to authenticated;

drop policy if exists "Admin insert devtools" on api.devtools;
create policy "Admin insert devtools"
on api.devtools
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'example@gmail.com');

