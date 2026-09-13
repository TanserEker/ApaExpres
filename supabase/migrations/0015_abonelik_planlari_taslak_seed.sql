-- TASLAK — Tanser onayı bekliyor. Bu migration subscription_plans tablosuna örnek
-- abonelik/kredi paketi satırları ekliyor ki Görev 4'teki checkout/hesap ekranları
-- gerçek veriyle görülüp test edilebilsin. AŞAĞIDAKİ FİYAT/SIKLIK/PAKET DEĞERLERİ
-- GERÇEK BİR İŞ KARARI DEĞİL — sadece yapı/mantığı göstermek için 0010'daki 5L
-- katalog fiyatlarına (ortalama ~7 RON/bidon) kabaca dayanan örnek sayılar.
--
-- is_active = false OLARAK BIRAKILDI: Tanser gerçek sıklık/indirim/paket
-- büyüklüğü kararını verene kadar müşteri tarafında GÖRÜNMESİN diye (checkout
-- zaten "aktif abonelik planı yok" durumunu zarifçe gösteriyor, bkz.
-- src/components/customer/CheckoutForm.tsx). Tanser onayladığında bu dosyadaki
-- rakamlar güncellenip (veya yeni bir migration'la) is_active = true yapılmalı.
--
-- Öneri mantığı (değiştirilebilir):
--   - subscription: haftada 1/2/3 teslimat, bidon başı fiyat tek seferliğe göre
--     hafif indirimli (sadakat/öngörülebilirlik karşılığı).
--   - credit_pack: 10/15/20 bidonluk peşin paket, miktar arttıkça birim fiyat düşer.

-- Migration'ın tekrar çalıştırılması yinelenen satır oluşturmasın diye (bkz. 0010'daki
-- aynı gerekçe). frequency/pack_size null olabildiği için coalesce ile normalize edildi
-- (Postgres unique index'lerde NULL'ları varsayılan olarak birbirinden farklı sayar).
create unique index if not exists subscription_plans_type_freq_pack_unique
  on subscription_plans (plan_type, coalesce(frequency, 0), coalesce(pack_size, 0));

insert into subscription_plans (plan_type, frequency, pack_size, unit_price, total_price, is_active)
values
  ('subscription', 1, null, 6.90, null, false), -- TASLAK: haftada 1 teslimat
  ('subscription', 2, null, 6.50, null, false), -- TASLAK: haftada 2 teslimat
  ('subscription', 3, null, 6.20, null, false), -- TASLAK: haftada 3 teslimat
  ('credit_pack', null, 10, 6.80, 68.00, false),  -- TASLAK: 10 bidonluk paket
  ('credit_pack', null, 15, 6.50, 97.50, false),  -- TASLAK: 15 bidonluk paket
  ('credit_pack', null, 20, 6.20, 124.00, false)  -- TASLAK: 20 bidonluk paket
on conflict (plan_type, coalesce(frequency, 0), coalesce(pack_size, 0)) do nothing;
