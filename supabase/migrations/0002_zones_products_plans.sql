-- Katalog tabloları: bölgeler, ürünler ve satış planları (tek seferlik / abonelik / kredi paketi).
-- Bunlar müşteri uygulamasında (PWA) sipariş öncesi gösterilen genel katalog verisidir,
-- bu yüzden herkese (anon dahil) salt okunur açıktır. Yazma sadece service role ile yapılır.

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- örn. "Cosmopolis" — sabit kodlanmaz, veri olarak eklenir
  city text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- örn. "19L Damacana Su"
  size_liters numeric(5,2) not null check (size_liters > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0), -- KDV dahil tek seferlik fiyat
  deposit_price numeric(10,2) not null default 0 check (deposit_price >= 0), -- şu an müşteriden alınmıyor ama şema esnek kalsın diye tutuluyor
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  plan_type text not null check (plan_type in ('one_time', 'subscription', 'credit_pack')),
  frequency int check (frequency in (1, 2, 3)), -- haftada kaç teslimat (sadece subscription için dolu)
  pack_size int check (pack_size in (10, 15, 20)), -- kaç bidonluk paket (sadece credit_pack için dolu)
  unit_price numeric(10,2) not null check (unit_price >= 0), -- bidon başı fiyat (KDV dahil)
  total_price numeric(10,2), -- kredi paketlerinde peşin toplam tutar (KDV dahil)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint subscription_plans_frequency_only_for_subscription
    check (plan_type = 'subscription' or frequency is null),
  constraint subscription_plans_pack_size_only_for_credit_pack
    check (plan_type = 'credit_pack' or pack_size is null)
);

alter table zones enable row level security;
alter table products enable row level security;
alter table subscription_plans enable row level security;

drop policy if exists "herkes aktif bolgeleri gorebilir" on zones;
create policy "herkes aktif bolgeleri gorebilir"
  on zones for select using (is_active = true);

drop policy if exists "herkes aktif urunleri gorebilir" on products;
create policy "herkes aktif urunleri gorebilir"
  on products for select using (is_active = true);

drop policy if exists "herkes aktif planlari gorebilir" on subscription_plans;
create policy "herkes aktif planlari gorebilir"
  on subscription_plans for select using (is_active = true);

-- Not: insert/update/delete için hiçbir policy tanımlanmadı — katalog verisi
-- sadece service role (admin paneli/server action) ile yönetilir.
