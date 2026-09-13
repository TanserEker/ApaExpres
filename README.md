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

### Alternatif tedarik yolu — kendi markanla fason şişeleme (henüz karar verilmedi)

Toptan alım yerine Romanya'da bir su üreticisine (Zizin, Cumpana, Beviaqua, Izvoria gibi
firmalara — 19L dispenser hattı olan, private-label/fason şişeleme yapan üreticiler)
**Apa Expres markasıyla** kendi 19L bidonunu şişelettirme seçeneği araştırıldı. Bu yola
gidilirse, marka sahibi olarak (üretim izinleri zaten üreticide olduğu için) gereken adımlar:

| Adım | Maliyet | Süre |
|---|---|---|
| CAEN kod ekleme (ONRC mențiune) | ~152 lei | Birkaç iş günü |
| DSVSA gıda işletmecisi kaydı (domeniul nonanimal, "înregistrare") | Genelde ücretsiz | Birkaç gün-hafta |
| OSIM marka tescili (opsiyonel ama önerilir) | ~1.000-1.800 lei | 8-10 ay |
| GS1 Romania barkod (sadece market rafına girecekse gerekli) | ~9 EUR/kod | Birkaç gün |
| SGR kaydı (sadece 0,1-3L format seçilirse) | Ücretsiz | Satıştan **en az 30 gün önce** |

Su kategorisi olarak "apă minerală naturală" değil **"apă de izvor"** seçilmesi öneriliyor —
üreticinin zaten sahip olduğu ruhsata dayanır, yeni kaynak tanınma sürecine girmeye gerek
kalmaz. Marka tescili beklenmeden satışa başlanabilir (tescil geriye dönük koruma sağlamaz
ama satışı bloke etmez). Bu seçenek şu an sadece bir alternatif olarak not edildi, öncelik
hâlâ mevcut toptan tedarik (METRO/Barbarossa) üzerinden ilerlemek.

### İlk faz — 5L katalog (bkz. `0010_ilk_faz_5l_katalog.sql`)

SGR kapsamı dışı (0,1-3L değil), bu yüzden RetuRO kaydı beklenmeden bu hafta satışa
başlanabilir. Fiyatlandırma METRO toptan + Carrefour/Kaufland/Penny (Glovo üzerinden,
2026-09-10 tarihli) rakip fiyat araştırmasına dayanır — detaylar migration dosyasının
başındaki yorumlarda. `zones.delivery_fee` de aynı araştırmadan: gözlemlenen en düşük
rakip teslimat ücretinin (Carrefour, Cosmopolis içi, 9,99 RON) %15 altı.

**Ürün adet seçici notu:** 5L su genelde 2'li paketler halinde satılıyor/tüketiliyor —
müşteri arayüzünde adet seçici 1'er değil **2'şer artmalı** (2-4-6-8...). Tek şişelik
sipariş matematiksel olarak zarar etmiyor (bkz. kâr-zarar hesabı, sohbet geçmişi) ama
doğal tüketim alışkanlığına uymuyor; 2'li artış hem UX'i basitleştirir hem ortalama sepet
büyüklüğünü organik olarak yükseltir.

## Yasal gereklilikler (2026-09-10 tarihli araştırma)

**Şirket/CAEN:** DEEF SRL üzerinden yürütülüyor, yeni tüzel kişilik gerekmiyor — sadece
perakende içecek/e-ticaret satışına uygun bir CAEN kodu eklenmeli (bkz. "Tanser'in yapması
gerekenler").

**ANSVSA gıda güvenliği kaydı (gerekli):** üretici değil, paketlenmiş ürün depolayıp
dağıtan bir işletme olarak "Domeniul Nonanimal" kapsamında bir **kayıt** (înregistrare,
tam yetkilendirme değil) gerekiyor — form: "Cerere Model Pentru Inregistrare Siguranta
Alimentelor - Domeniul Nonanimal", yerel DSVSA'ya başvurulur. Kategori: hayvansal olmayan
gıda deposu.

**Fatura/fiş yaklaşımı — bon fiscal, e-Factura değil:** RO e-Factura 2026 itibariyle
B2C dahil zorunlu hale geldi (her fatura ANAF SPV'ye 5 iş günü içinde gönderilmeli) —
AMA bu zorunluluk **factură** (resmi fatura) için geçerli, **bon fiscal** (yazar kasa
fişi) için değil. ANAF'ın kendi kaynağına göre bir bon fiscal satışında SPV'ye gönderim
sadece müşteri açıkça resmi fatura talep ederse gerekiyor. Bu yüzden plan: DEEF üzerine
**sanal pos + yazar kasa** (mobil/taşınabilir fiskal cihaz) alınacak, her sipariş bon
fiscal ile kapatılacak, bonlar 2 günde bir muhasebeciye iletilecek. Bu, e-Factura API
entegrasyonu geliştirmekten çok daha basit ve tamamen yasal — sadece nadir bir müşteri
resmi fatura isterse o tekil işlem için 5 iş günü içinde SPV'ye gönderim gerekir.

**E-ticaret/mesafeli satış standartları:** Termeni și Condiții, Politica de Confidențialitate
(GDPR — ad/adres/telefon toplandığı için), çerez politikası, ANPC/SOL bağlantısı. Su gibi
çabuk tüketilen bir ürün için cayma hakkı büyük ölçüde istisna kapsamına girer.
