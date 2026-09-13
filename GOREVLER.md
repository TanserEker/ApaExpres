# Apa Expres — Görev Sırası (Barış için, Onur tarafından hazırlandı, 2026-09-13)

Tek geliştirici olduğu için paralel değil, sıralı ilerlenir. Her görev bir öncekinin
üstüne biner. Referans kaynak: `/Users/7ans7ker/aycabayramoglu` ve
`/Users/7ans7ker/aycabayramoglu/mobile` (Next.js + Supabase + rol bazlı RLS + PWA + web
push deseni; mobile için Expo iskeleti) — sadece klasör/desen referansı, kopyala-yapıştır
kod taşıma değil.

## FAZ 1 — Web + PWA (müşteri, admin, kurye)

**1. Auth + rol şeması + RLS genişletme** — 2 gün
Kapsam: Supabase Auth ile `auth.users` → `customers`/`drivers`/admin rolü bağlama; şu an
sadece select policy'si olan tablolara (bkz. README "Veritabanı şeması") gerçek
insert/update policy'leri eklenecek yeni migration(lar) (0011+).
Kabul: 3 rol için de sign up/sign in çalışıyor; her rol sadece `is_own_customer()` /
`is_own_driver()` kapsamındaki veriyi görüp değiştirebiliyor.
Dokunur: `supabase/migrations/0011+`, `src/lib/supabase/*`, yeni auth sayfaları.
Ayça'dan: `middleware.ts` ve rol bazlı RLS/admin klasör deseni (yapıya bak).
Tanser beklemez — yerel Postgres/Supabase CLI ile ilerler.

**2. i18n kurulumu (RO/EN/TR)** — 1 gün
Kapsam: next-intl (veya eşdeğeri), `/ro /en /tr` URL segmenti, mesaj dosyası iskeleti.
Kabul: 3 dilde anasayfa render oluyor, dil değişimi çalışıyor.
Dokunur: `src/app/[locale]/`, `messages/`, `middleware.ts`, `next.config.ts`.
Ayça'dan: yok (next-intl standart kurulum).
Tanser beklemez.

**3. Müşteri sipariş akışı** — 3 gün
Kapsam: 5L katalog listesi (`products`, adet seçici 2'şer artan), adres formu
(blok/scară/etaj/daire + telefon), tek seferlik + abonelik seçimi, `create_order`
server action/RPC (README'de anılan `deeftech-restoran-saas` deseni, service role ile).
Kabul: Müşteri ürün seçip sipariş oluşturabiliyor; `orders`/`order_items`/
`order_status_history` doğru satırlarla oluşuyor (yerel test ortamında).
Dokunur: `src/app/[locale]/(customer)/**`, `src/app/actions/create-order.ts` (yeni).
Ayça'dan: `create_order` RPC deseni, form/validasyon yaklaşımı.
Tanser beklemez — fiyatlar zaten `0010_ilk_faz_5l_katalog.sql`'da sabit.

**4. Abonelik + kredi UI** — 2 gün (bağımlı: 3)
Kapsam: müşteri panelinde plan seçme/kredi bakiyesi; admin tarafında kredi/abonelik RPC'leri.
Kabul: abonelik oluşturma, kredi artır/düş test edilebiliyor.
Dokunur: `src/app/actions/subscriptions.ts`, ilgili sayfalar.

**5. Admin paneli** — 3 gün (bağımlı: 1, 3)
Kapsam: sipariş listesi/filtre, onaylama, kurye atama (`driver_assignments`), katalog
(`products`) CRUD, `capacity_slots` yönetimi.
Kabul: admin sipariş onaylayıp kuryeye atayabiliyor; ürün ekle/düzenle/pasifleştir çalışıyor.
Dokunur: `src/app/admin/**`, `src/app/actions/admin-*.ts`.
Ayça'dan: `src/components/admin` klasör deseni.

**6. Kurye arayüzü (web)** — 2 gün (bağımlı: 1, 5)
Kapsam: kurye girişi, kendine atanan siparişler, durum güncelleme (onaylandı→yolda→
teslim edildi), opsiyonel teslimat fotoğrafı (Supabase Storage).
Kabul: durum değiştirilebiliyor, fotoğraf opsiyonel yükleniyor.
Dokunur: `src/app/[locale]/kurye/**`, storage bucket migration'ı.

**7. PWA + opsiyonel push bildirim** — 1,5 gün (bağımlı: 3, 5, 6)
Kapsam: `manifest.ts`, `sw.js`, ikonlar; sipariş durum bildirimleri için web push.
Kabul: "Add to Home Screen" çalışıyor, Lighthouse PWA denetimi geçer.
Ayça'dan: `manifest.ts`, `public/sw.js`, `src/lib/web-push.ts`, `webPushClient.ts`.

**8. Yasal sayfalar** — 1 gün (bağımsız, herhangi bir aşamada eklenebilir)
Kapsam: T&C, Gizlilik, çerez bildirimi, ANPC/SOL linki — 3 dilde.
Ayça'dan: `src/app/gizlilik` deseni.

**9. Fiş/fatura no alanı** — 0,5 gün (bağımlı: 5)
Kapsam: `orders`a bon fiscal/fiş no alanı (migration) + admin formu.

**10. Uçtan uca test + canlı deploy** — 1,5 gün (bağımlı: hepsi + canlı Supabase)
Kapsam: tüm akışların testi, Vercel deploy, canlı env değişkenleri.

## FAZ 2 — Expo (müşteri + kurye tek app)

**E1. Expo iskeleti** — 1 gün — `aycabayramoglu/mobile` şablonundan kopyala, Supabase client, auth.
**E2. Müşteri ekranları** — 3 gün — katalog/sipariş/geçmiş, web akışının native karşılığı (bağımlı: Faz1/3,4).
**E3. Kurye ekranı + kamera + push** — 2 gün — teslimat fotoğrafı (expo-camera), expo-push bildirim (bağımlı: Faz1/6).
**E4. Store hazırlığı** — 1 gün — ikon/splash, `app.json`, gizlilik linki, TestFlight/Play internal test.
**E5. Store submission** — süre belirsiz (mağaza onay süreci) — App Store/Google Play.

## Tanser beklemeden hemen başlanacak ilk 3 görev
1. Auth + rol şeması + RLS genişletme
2. i18n kurulumu
3. Müşteri sipariş akışı (katalog + sepet + create_order)

## Tanser'e bağlı bloklayanlar
- **Canlı Supabase projesi yok** → Görev 10 (canlı deploy) ve gerçek ortamda uçtan uca doğrulama bekler; 1-9 yerel/CLI ile ilerler.
- **Mağaza hesapları (Apple Developer / Google Play Console) yok** → E4/E5 (Faz 2 store hazırlığı ve gönderim) bekler.
- **Tedarikçi/fiyat kesinleşmesi (Barbarossa/METRO)** → Görev 5'te (admin katalog) nihai fiyat/marj güncellemesini etkiler; şu an geçici fiyatlarla ilerlenebilir, bloklayıcı değil.
- **CAEN kodu / ANSVSA kaydı / e-Factura-POS kararı teyidi** → sipariş akışını (1-9) bloklamaz, ama "canlıya gerçek satışla açma" kararını ve Görev 9'daki fiş alanı formatını bekletir.
