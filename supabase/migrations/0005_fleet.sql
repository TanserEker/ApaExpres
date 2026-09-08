-- Araçlar ve sürücüler. Tamamen iç sistem — sürücü kendi kaydını ve kendine atanan
-- aracı görebilir, geri kalan her şey (ekleme/silme/başka sürücüyü görme) service role.

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones(id) on delete restrict,
  plate text not null unique,
  capacity int not null check (capacity > 0), -- araç başına taşınabilecek bidon sayısı
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  zone_id uuid not null references zones(id) on delete restrict,
  vehicle_id uuid references vehicles(id) on delete set null,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Giriş yapan kullanıcının verilen driver_id'nin sahibi olup olmadığını kontrol eden
-- SECURITY DEFINER helper — customers.is_own_customer() ile aynı desen.
create or replace function is_own_driver(target_driver_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from drivers
    where id = target_driver_id
      and auth_user_id = auth.uid()
  );
$$;

revoke execute on function is_own_driver(uuid) from anon;

alter table vehicles enable row level security;
alter table drivers enable row level security;

drop policy if exists "surucu kendi kaydini gorebilir" on drivers;
create policy "surucu kendi kaydini gorebilir"
  on drivers for select using (auth_user_id = auth.uid());

drop policy if exists "surucu kendine atanan araci gorebilir" on vehicles;
create policy "surucu kendine atanan araci gorebilir"
  on vehicles for select using (
    exists (
      select 1 from drivers d
      where d.vehicle_id = vehicles.id
        and d.auth_user_id = auth.uid()
    )
  );

-- Not: vehicles/drivers üzerinde insert/update/delete policy'si yok — filo yönetimi
-- sadece admin panelinden (service role) yapılır.
