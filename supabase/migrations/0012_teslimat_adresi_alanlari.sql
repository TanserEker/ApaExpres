-- Görev 3 (müşteri sipariş akışı) adres formu, Cosmopolis'e özgü tam adres modelini
-- gerektiriyor: bloc/scară/etaj/apartament + telefon (bkz. GOREVLER.md "Kesin kararlar").
-- 0003_customers.sql'deki delivery_addresses sadece block/floor/apartment/notes ile
-- kurulmuştu — "scară" (blok girişi) ve teslimat bazlı iletişim telefonu eksikti.
-- Sütun adları mevcut şemayla aynı dilde (İngilizce) tutuldu, Romence karşılıkları
-- yorumda belirtildi.
alter table delivery_addresses
  add column if not exists staircase text, -- scară
  add column if not exists phone text; -- bu adrese özel teslimat telefonu (müşterinin hesap telefonundan farklı olabilir)

-- Var olan RLS policy'si ("musteri kendi adreslerini yonetir", 0003) zaten
-- `for all` olduğu için yeni sütunlar otomatik kapsanıyor, ek policy gerekmiyor.
