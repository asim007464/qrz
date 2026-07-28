-- Allow public read of editable website copy (admin writes via service role)
drop policy if exists "Public read lockdown setting" on public.site_settings;

create policy "Public read site settings"
  on public.site_settings
  for select
  using (key in ('lockdown', 'site_copy'));

insert into public.site_settings (key, value)
values ('site_copy', '{}'::jsonb)
on conflict (key) do nothing;
