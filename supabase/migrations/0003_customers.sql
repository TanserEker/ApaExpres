-- Müşteriler ve teslimat adresleri. Bir müşterinin auth hesabı olabilir de olmayabilir de
-- (örn. telefonla/kapıda kayıt olan ama henüz PWA'ya giriş yapmamış müşteri) — bu yüzden
-- auth_user_id nullable.

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text not null,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists delivery_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  zone_id uuid not null references zones(id) on delete restrict,
  block text, -- Cosmopolis gibi site içi adreslerde blok/etaj/daire modeli
  floor text,
  apartment text,
  notes text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

-- Giriş yapan kullanıcının verilen customer_id'nin sahibi olup olmadığını kontrol eden
-- SECURITY DEFINER helper — restoran SaaS'taki is_restaurant_staff() ile aynı desen.
create or replace function is_own_customer(target_customer_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from customers
    where id = target_customer_id
      and auth_user_id = auth.uid()
  );
$$;

revoke execute on function is_own_customer(uuid) from anon;

alter table customers enable row level security;
alter table delivery_addresses enable row level security;

drop policy if exists "musteri kendi kaydini gorebilir" on customers;
create policy "musteri kendi kaydini gorebilir"
  on customers for select using (auth_user_id = auth.uid());

drop policy if exists "musteri kendi kaydini gunceller" on customers;
create policy "musteri kendi kaydini gunceller"
  on customers for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

-- PWA'da giriş yapmış ama henüz müşteri kaydı olmayan kullanıcının kendi kaydını
-- oluşturabilmesi için (self sign-up akışı).
drop policy if exists "kullanici kendi musteri kaydini olusturabilir" on customers;
create policy "kullanici kendi musteri kaydini olusturabilir"
  on customers for insert with check (auth_user_id = auth.uid());

drop policy if exists "musteri kendi adreslerini yonetir" on delivery_addresses;
create policy "musteri kendi adreslerini yonetir"
  on delivery_addresses for all
  using (is_own_customer(customer_id))
  with check (is_own_customer(customer_id));
