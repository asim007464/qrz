-- Grant admin role on signup for super-admin emails
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, callsign, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'callsign', ''),
    coalesce(new.email, ''),
    case
      when lower(coalesce(new.email, '')) in ('qrzinfo@gmail.com', 'ehamhub@gmail.com') then 'admin'
      else 'member'
    end
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- Promote existing eHamHub account if already registered
update public.profiles
set role = 'admin'
where lower(email) = 'ehamhub@gmail.com' and role <> 'admin';
