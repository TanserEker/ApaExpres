# Apa Expres

DEEF SRL'ye ait, Romanya / Ştefănești, **Cosmopolis Complex** için hızlı (1 saat) 19L damacana
su teslimat sistemi. Kendi su markası yok — toptan alınan suyun **Apa Expres** markasıyla hızlı
dağıtımı yapılıyor. Vaat: *"Cosmopolis'te 1 saat içinde kapınızda."*

Bu, DEEF-TECH'in yazılım ajansı müşteri işlerinden ayrı, Tanser'in kendi ticari projesidir.

## Mimari özet

- **Next.js 16 (App Router) + Supabase (Postgres, Auth, Realtime, Storage).**
- **PWA** olarak planlanıyor — native mobil uygulama yok.
- İç sistem mantığı: müşteriye açık genel bir "herkese açık" API yok, çoğu mutasyon
  (sipariş oluşturma, kredi/abonelik yönetimi, atama) service role ile server action/RPC
  üzerinden yapılacak (bkz. `src/lib/supabase/service.ts` ve `deeftech-restoran-saas`'taki
  `create_order` deseni). RLS, müşterinin/sürücünün PWA'da sadece kendi verisini görebilmesi
  için temel bir iskelet olarak kuruldu — bkz. "Veritabanı şeması" bölümü.

### Supabase client'ları

- `src/lib/supabase/client.ts` — tarayıcı (Client Component) tarafı, anon key ile.
- `src/lib/supabase/server.ts` — Server Component/Server Action tarafı, kullanıcının oturum
  cookie'siyle (anon key + RLS uygulanır).
- `src/lib/supabase/service.ts` — **sadece** sunucu tarafı güvenilir kodda (server action,
  admin paneli, cron/webhook). RLS'yi tamamen atlar, asla tarayıcıya sızdırılmamalı.
- `src/lib/supabase/types.ts` — şemadaki tüm tabloların basitleştirilmiş TypeScript satır
  tipleri. Gerçek bir Supabase projesi bağlanınca `supabase gen types typescript` ile
  otomatik üretilen `Database` tipiyle değiştirilebilir/genişletilebilir.

## Veritabanı şeması (`supabase/migrations/`)

Migration'lar bağımlılık sırasına göre numaralandırıldı (Onur'un çıkardığı tam tablo
listesini kapsar):

| Dosya | İçerik |
|---|---|
| `0001_extensions.sql` | `pgcrypto` eklentisi, ortak `updated_at` trigger fonksiyonu |
| `0002_zones_products_plans.sql` | `zones`, `products`, `subscription_plans` (katalog — herkese açık okuma) |
| `0003_customers.sql` | `customers`, `delivery_addresses`, `is_own_customer()` helper |
| `0004_subscriptions_credits.sql` | `customer_subscriptions`, `customer_credits`, `credit_transactions` |
| `0005_fleet.sql` | `vehicles`, `drivers`, `is_own_driver()` helper |
| `0006_capacity_slots.sql` | `capacity_slots` (bölge/saat bazlı teslimat kapasitesi) |
| `0007_orders.sql` | `orders`, `order_items`, `order_status_history`, `payments` (+ `credit_transactions.order_id` için ertelenen FK) |
| `0008_driver_assignments.sql` | `driver_assignments` |
| `0009_bottle_stock_movements.sql` | `bottle_stock_movements` (bidon stok/depozito muhasebesi) |

Her tabloda RLS **açık**. Katalog tabloları (`zones`, `products`, `subscription_plans`) ve
`capacity_slots` dışında hiçbir tabloda anon/authenticated için insert/update/delete
policy'si yok — mutasyonlar service role ile yapılır. Müşteri/sürücü sadece kendi verisini
(`is_own_customer()` / `is_own_driver()` üzerinden) görebilir. Bu, "temel RLS iskeleti"dir;
gerçek Supabase projesi bağlanıp gerçek auth akışları (müşteri/sürücü girişi) kurulunca
policy'ler gözden geçirilip genişletilmeli.

**Migration'lar henüz canlı bir Supabase projesine uygulanmadı** — sadece yerel bir Postgres
16 üzerinde (auth şeması/rolleri taklit edilerek) sırayla çalıştırılıp doğrulandı; hem şema
oluşturma hem de örnek insert/foreign key/check constraint testleri hatasız geçti.

## Mevcut durum

- [x] Next.js App Router projesi kuruldu (`create-next-app`, TypeScript + Tailwind + ESLint).
- [x] Supabase client/server/service boilerplate'i kuruldu.
- [x] Tüm tablolar migration dosyaları olarak yazıldı, RLS iskeleti eklendi, yerel Postgres'te doğrulandı.
- [x] `.env.example` eklendi.
- [x] Boş bir `/admin` sayfası eklendi; `npm run dev`, `npm run build`, `npm run lint` hatasız.
- [ ] Gerçek Supabase projesi henüz yok — migration'lar canlıya uygulanmadı.
- [ ] Admin paneli, müşteri PWA akışı, sipariş oluşturma RPC'si, dispatch/atama mantığı henüz yazılmadı (sıradaki görevler).

## Kurulum

1. `npm install`
2. Yeni bir Supabase projesi açıldıktan sonra `.env.example`'ı `.env.local` olarak kopyalayıp
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   değerlerini girin.
3. `supabase/migrations/` altındaki dosyaları sırayla (Supabase CLI ile `supabase db push`
   veya SQL editöründen elle) çalıştırın.
4. `npm run dev`

## Tanser'in yapması gerekenler (sıradaki adımlar)

1. **Yeni bir Supabase projesi aç** (bölge olarak AB/Frankfurt tercih edilebilir — Romanya'ya
   yakın, GDPR uyumu için) ve URL/anon key/service role key bilgilerini paylaş.
2. **DEEF SRL için CAEN kodunu netleştir** (su dağıtım/perakende faaliyetine uygun kod —
   muhasebeci ile teyit edilmeli).
3. **Tedarikçiyi netleştir** (Barbarossa Retail SRL veya METRO gibi bir kaynak) — toptan
   fiyat referansı ~14,96 lei/bidon (KDV dahil) olarak not edildi, kesinleşince
   `products`/maliyet hesaplarına yansıtılacak.

Bu üç madde netleşince Onur ile birlikte sıradaki geliştirme adımı (Supabase projesine
migration'ların uygulanması + admin panel/PWA akışlarının kurulması) planlanabilir.
