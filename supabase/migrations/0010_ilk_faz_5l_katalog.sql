-- İlk faz: 5L su kataloğu (SGR kapsamı dışı, bu hafta satışa başlanabilir — bkz. proje notları).
-- 19L damacana ve 0,5-2L SGR'li formatlar SGR kaydı (RetuRO, en az 30 gün önceden) tamamlanınca
-- ayrı bir migration'la eklenecek.

-- products.brand: aynı boyuttaki (5L) farklı markaları ayırt etmek için gerekli — mevcut şemada
-- "name" tek başına marka+boyut kombinasyonunu taşımıyordu.
alter table products add column if not exists brand text;

-- zones.delivery_fee: sabit teslimat ücreti.
-- KURAL (ileride kurulacak otomatik rakip takip sistemi için de geçerli formül):
--   teslimat_ücreti = en_düşük_gözlemlenen_rakip_teslimat_ücreti × 0,85 (yani %15 altı)
-- 2026-09-10 itibariyle en düşük gözlemlenen rakip: Carrefour (Cosmopolis içi), 9,99 RON.
--   9,99 × 0,85 = 8,49 RON.
alter table zones add column if not exists delivery_fee numeric(10,2) not null default 0
  check (delivery_fee >= 0);

-- Migration'ın tekrar çalıştırılması (örn. yerel test ortamında) yinelenen satır oluşturmasın
-- diye — bu iki unique index olmadan aşağıdaki "on conflict do nothing" hiçbir işe yaramazdı.
-- (ADD CONSTRAINT ... IF NOT EXISTS PostgreSQL'de desteklenmiyor, bu yüzden unique index kullanıldı —
-- ON CONFLICT bir unique index'i de hedef alabiliyor, isimli constraint şart değil.)
create unique index if not exists zones_name_unique on zones (name);
create unique index if not exists products_brand_size_unique on products (brand, size_liters);

insert into zones (name, city, is_active, delivery_fee)
values ('Cosmopolis', 'Ştefăneşti', true, 8.49)
on conflict (name) do nothing;

-- Fiyatlandırma mantığı (2026-09-10 tarihli METRO toptan + Carrefour/Kaufland/Penny rakip
-- fiyat araştırmasına dayanır).
-- KURAL (rakip varsa): satış_fiyatı = en_düşük_gözlemlenen_rakip_fiyatı − 0,50 RON (max).
-- KURAL (rakip yoksa): mevcut toptan-maliyet bazlı marj korunur.
--   aro, Miraqua, Keia -> yerel marketlerde (Carrefour/Kaufland/Penny) karşılığı bulunamadı,
--                         rakip tavanı yok, saf marj mantığıyla fiyatlandırıldı.
--   Zizin Blue         -> en düşük rakip 7,95 RON (Carrefour/Penny) − 0,50 = 7,45 RON.
--   Aqua Carpatica     -> en düşük rakip 10,49 RON (Carrefour) − 0,50 = 9,99 RON.
insert into products (name, brand, size_liters, unit_price, deposit_price, is_active)
values
  ('aro Apa de Izvor Plata 5L', 'aro', 5, 4.50, 0, true),
  ('Miraqua Apa de Izvor Plata 5L', 'Miraqua', 5, 5.00, 0, true),
  ('Keia Apa Minerala Naturala Plata 5L', 'Keia', 5, 8.50, 0, true),
  ('Zizin Blue Apa de Izvor 5L', 'Zizin Blue', 5, 7.45, 0, true),
  ('Aqua Carpatica Apa Minerala Plata 5L', 'Aqua Carpatica', 5, 9.99, 0, true)
on conflict (brand, size_liters) do nothing;
