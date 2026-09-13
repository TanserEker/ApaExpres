import type { AppLocale } from "@/i18n/routing";

// Görev 8: yasal sayfalar (T&C, Gizlilik, çerez bildirimi) — 3 dilde. İçerik
// aycabayramoglu/src/lib/kvkk.ts'teki gibi yapılı veri olarak tutuluyor (page.tsx
// sadece render ediyor), ama KVKK değil GDPR/ANPC (Romanya) bağlamı için baştan
// yazıldı — bkz. README "Yasal gereklilikler" bölümündeki 2026-09-10 araştırması.
//
// ÖNEMLİ: Bu metinler DEEF SRL'nin gerçek CAEN/ANSVSA/e-Factura durumuna göre
// hazırlanmış makul bir taslaktır, bir avukat/muhasebeci onayının yerine geçmez —
// canlıya tam açılmadan önce Tanser'in muhasebecisiyle bir kez teyit edilmesi
// önerilir (bkz. README "Tanser'in yapması gerekenler").

export type LegalSection = { heading: string; body: string };
export type LegalDoc = { title: string; lastUpdated: string; sections: LegalSection[] };

const LAST_UPDATED = "2026-09-13";

export const LEGAL_CONTENT: Record<"terms" | "privacy" | "cookies", Record<AppLocale, LegalDoc>> = {
  terms: {
    ro: {
      title: "Termeni și Condiții",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. Operatorul serviciului",
          body: "Serviciul Apa Expres este operat de DEEF SRL și oferă livrarea rapidă (obiectiv: 1 oră) a apei îmbuteliate de 5L, provenită de la mărci terțe, în complexul rezidențial Cosmopolis, Ștefănești.",
        },
        {
          heading: "2. Comanda și prețul",
          body: "Prețurile afișate în catalog includ TVA. Comanda unică se plătește la livrare (numerar sau card), conform metodei alese la finalizarea comenzii. Taxa de livrare este afișată separat înainte de trimiterea comenzii. Comenzile se acceptă zilnic între orele 09:00–20:00.",
        },
        {
          heading: "3. Abonamente și pachete de credit",
          body: "Abonamentele (livrare recurentă săptămânală) și pachetele de credit (bidoane preplătite) pot fi gestionate din secțiunea „Contul meu” — duraminstiv suspendare sau anulare oricând, fără penalități. Bidonele dintr-un pachet de credit nu expiră.",
        },
        {
          heading: "4. Dreptul de retragere",
          body: "Conform OUG 34/2014 (transpunere Directiva 2011/83/UE), dreptul de retragere din contractele la distanță nu se aplică bunurilor perisabile sau care se deteriorează rapid — apa îmbuteliată livrată intră în această categorie odată ce livrarea a fost efectuată. Vă rugăm să verificați produsul la livrare; orice neconformitate trebuie semnalată curierului sau la contact în cel mai scurt timp.",
        },
        {
          heading: "5. Răspundere",
          body: "Apa Expres distribuie produse de la mărci terțe (nu produce apa) — calitatea produsului este garantată de producător conform etichetei. Apa Expres răspunde pentru manipularea și livrarea corectă a produsului.",
        },
        {
          heading: "6. Soluționarea litigiilor",
          body: "Pentru reclamații, ne puteți contacta direct. Aveți de asemenea dreptul de a vă adresa Autorității Naționale pentru Protecția Consumatorilor (ANPC, anpc.ro) sau platformei europene de soluționare online a litigiilor (SOL): ec.europa.eu/consumers/odr.",
        },
      ],
    },
    en: {
      title: "Terms & Conditions",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. Service operator",
          body: "Apa Expres is operated by DEEF SRL and offers fast delivery (target: 1 hour) of third-party brand 5L bottled water within the Cosmopolis residential complex, Ștefănești, Romania.",
        },
        {
          heading: "2. Orders and pricing",
          body: "Catalog prices include VAT. One-time orders are paid on delivery (cash or card), as selected at checkout. The delivery fee is shown separately before you submit your order. Orders are accepted daily between 09:00–20:00.",
        },
        {
          heading: "3. Subscriptions and credit packs",
          body: "Weekly recurring subscriptions and prepaid credit packs can be managed from \"My account\" — pause or cancel anytime, no penalties. Bottles in a credit pack do not expire.",
        },
        {
          heading: "4. Right of withdrawal",
          body: "Under Romanian/EU distance-selling rules, the right of withdrawal does not apply to goods that are perishable or deteriorate quickly — delivered bottled water falls into this category once delivery has taken place. Please check your order on delivery; report any issue to the courier or our contact as soon as possible.",
        },
        {
          heading: "5. Liability",
          body: "Apa Expres distributes third-party brand products (we do not manufacture the water) — product quality is guaranteed by the manufacturer as stated on the label. Apa Expres is responsible for correct handling and delivery.",
        },
        {
          heading: "6. Dispute resolution",
          body: "For complaints, please contact us directly. You may also contact the Romanian National Authority for Consumer Protection (ANPC, anpc.ro) or the EU Online Dispute Resolution platform (ODR): ec.europa.eu/consumers/odr.",
        },
      ],
    },
    tr: {
      title: "Kullanım Koşulları",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. Hizmet sağlayıcı",
          body: "Apa Expres, DEEF SRL tarafından işletilir ve Romanya, Ştefăneşti'teki Cosmopolis rezidans kompleksinde üçüncü taraf markalara ait 5L şişe suyun hızlı (hedef: 1 saat) teslimatını sunar.",
        },
        {
          heading: "2. Sipariş ve fiyatlandırma",
          body: "Katalog fiyatlarına KDV dahildir. Tek seferlik siparişler, checkout'ta seçilen yönteme göre kapıda (nakit veya kart) ödenir. Teslimat ücreti sipariş onaylanmadan önce ayrı gösterilir. Siparişler her gün 09:00–20:00 arası kabul edilir.",
        },
        {
          heading: "3. Abonelikler ve kredi paketleri",
          body: "Haftalık tekrarlayan abonelikler ve peşin ödenen kredi paketleri \"Hesabım\" bölümünden yönetilebilir — cezasız olarak istediğiniz zaman duraklatabilir veya iptal edebilirsiniz. Kredi paketindeki bidonların son kullanma tarihi yoktur.",
        },
        {
          heading: "4. Cayma hakkı",
          body: "Romanya/AB mesafeli satış mevzuatına göre cayma hakkı, çabuk bozulabilen veya niteliği hızla değişen ürünlere uygulanmaz — teslim edilen şişe su, teslimat gerçekleştikten sonra bu kapsama girer. Lütfen siparişinizi teslimat sırasında kontrol edin; herhangi bir sorunu en kısa sürede kuryeye veya bize bildirin.",
        },
        {
          heading: "5. Sorumluluk",
          body: "Apa Expres üçüncü taraf marka ürünleri dağıtır (suyu kendisi üretmez) — ürün kalitesi etikette belirtildiği gibi üretici tarafından garanti edilir. Apa Expres, ürünün doğru şekilde taşınması ve teslimatından sorumludur.",
        },
        {
          heading: "6. Uyuşmazlık çözümü",
          body: "Şikayetleriniz için doğrudan bizimle iletişime geçebilirsiniz. Ayrıca Romanya Ulusal Tüketiciyi Koruma Otoritesi'ne (ANPC, anpc.ro) veya AB Çevrimiçi Uyuşmazlık Çözüm platformuna (SOL/ODR) başvurabilirsiniz: ec.europa.eu/consumers/odr.",
        },
      ],
    },
  },
  privacy: {
    ro: {
      title: "Politica de Confidențialitate",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. Operatorul de date",
          body: "DEEF SRL este operatorul de date cu caracter personal pentru serviciul Apa Expres, în sensul Regulamentului (UE) 2016/679 (GDPR).",
        },
        {
          heading: "2. Ce date colectăm",
          body: "Nume, telefon, adresă de e-mail (pentru autentificare), adresa de livrare (bloc/scară/etaj/apartament + telefon de contact) și istoricul comenzilor. Nu colectăm date de plată — plata se face la livrare, direct către curier.",
        },
        {
          heading: "3. De ce colectăm aceste date",
          body: "Pentru a procesa și livra comenzile, pentru a gestiona contul și abonamentele/pachetele de credit și pentru a vă contacta legat de o comandă. Dacă activați notificările push, endpoint-ul browserului este stocat exclusiv pentru trimiterea de notificări legate de starea comenzii.",
        },
        {
          heading: "4. Cât timp păstrăm datele",
          body: "Datele contului sunt păstrate cât timp contul este activ. Datele comenzilor sunt păstrate conform obligațiilor legale de arhivare fiscală/contabilă aplicabile în România.",
        },
        {
          heading: "5. Drepturile dumneavoastră",
          body: "Aveți dreptul de acces, rectificare, ștergere, restricționare a prelucrării, portabilitate și opoziție, conform GDPR. Pentru exercitarea acestor drepturi, ne puteți contacta direct. Aveți de asemenea dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP, dataprotection.ro).",
        },
        {
          heading: "6. Securitate",
          body: "Datele sunt stocate la un furnizor de infrastructură (Supabase) cu criptare în tranzit și la repaus, iar accesul este restricționat prin politici de securitate la nivel de rând (RLS) — fiecare cont vede exclusiv propriile date.",
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. Data controller",
          body: "DEEF SRL is the data controller for the Apa Expres service, within the meaning of Regulation (EU) 2016/679 (GDPR).",
        },
        {
          heading: "2. What data we collect",
          body: "Name, phone number, email address (for authentication), delivery address (block/staircase/floor/apartment + contact phone), and order history. We do not collect payment data — payment is made on delivery, directly to the courier.",
        },
        {
          heading: "3. Why we collect it",
          body: "To process and deliver orders, manage your account and subscriptions/credit packs, and contact you about an order. If you enable push notifications, your browser's subscription endpoint is stored solely to send order-status notifications.",
        },
        {
          heading: "4. How long we keep it",
          body: "Account data is kept while your account is active. Order data is kept in line with Romanian tax/accounting record-keeping obligations.",
        },
        {
          heading: "5. Your rights",
          body: "You have the right to access, rectify, erase, restrict processing, port your data, and object, under GDPR. Contact us directly to exercise these rights. You may also lodge a complaint with Romania's data protection authority (ANSPDCP, dataprotection.ro).",
        },
        {
          heading: "6. Security",
          body: "Data is stored with an infrastructure provider (Supabase), encrypted in transit and at rest, with access restricted via row-level security policies — each account can only see its own data.",
        },
      ],
    },
    tr: {
      title: "Gizlilik Politikası",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. Veri sorumlusu",
          body: "DEEF SRL, Apa Expres hizmeti için (AB) 2016/679 sayılı Tüzük (GDPR) kapsamında veri sorumlusudur.",
        },
        {
          heading: "2. Hangi verileri topluyoruz",
          body: "Ad, telefon, e-posta (giriş için), teslimat adresi (blok/scară/kat/daire + iletişim telefonu) ve sipariş geçmişi. Ödeme verisi toplamıyoruz — ödeme teslimatta doğrudan kuryeye yapılır.",
        },
        {
          heading: "3. Neden topluyoruz",
          body: "Siparişleri işlemek ve teslim etmek, hesabınızı ve abonelik/kredi paketlerinizi yönetmek, bir siparişle ilgili sizinle iletişime geçmek için. Push bildirimlerini açarsanız, tarayıcınızın abonelik uç noktası yalnızca sipariş durum bildirimleri göndermek için saklanır.",
        },
        {
          heading: "4. Ne kadar süre saklıyoruz",
          body: "Hesap verileri, hesabınız aktif olduğu sürece saklanır. Sipariş verileri, Romanya'daki vergi/muhasebe saklama yükümlülüklerine uygun şekilde saklanır.",
        },
        {
          heading: "5. Haklarınız",
          body: "GDPR kapsamında erişim, düzeltme, silme, işlemeyi kısıtlama, taşınabilirlik ve itiraz hakkına sahipsiniz. Bu hakları kullanmak için doğrudan bizimle iletişime geçebilirsiniz. Ayrıca Romanya veri koruma otoritesine (ANSPDCP, dataprotection.ro) şikayette bulunabilirsiniz.",
        },
        {
          heading: "6. Güvenlik",
          body: "Veriler bir altyapı sağlayıcısında (Supabase) aktarımda ve depolamada şifrelenerek tutulur; erişim satır düzeyi güvenlik (RLS) politikalarıyla kısıtlanmıştır — her hesap yalnızca kendi verisini görebilir.",
        },
      ],
    },
  },
  cookies: {
    ro: {
      title: "Politica de Cookie-uri",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. Ce sunt cookie-urile",
          body: "Cookie-urile sunt fișiere text mici stocate în browser. Apa Expres folosește exclusiv cookie-uri strict necesare pentru autentificare și menținerea sesiunii (Supabase Auth) — nu folosim cookie-uri de marketing sau analiză de la terți.",
        },
        {
          heading: "2. Cookie-uri strict necesare",
          body: "Cookie-uri de sesiune care vă păstrează autentificat pe durata vizitei și preferința de limbă (ro/en/tr). Acestea nu pot fi dezactivate fără a afecta funcționarea site-ului (de exemplu, plasarea unei comenzi necesită autentificare).",
        },
        {
          heading: "3. Notificări push",
          body: "Dacă activați notificările pentru starea comenzii, browserul creează o abonare push (nu este un cookie, dar este o tehnologie similară de stocare) — o puteți dezactiva oricând din setările browserului.",
        },
      ],
    },
    en: {
      title: "Cookie Notice",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. What cookies are",
          body: "Cookies are small text files stored in your browser. Apa Expres only uses strictly necessary cookies for authentication and session management (Supabase Auth) — we do not use third-party marketing or analytics cookies.",
        },
        {
          heading: "2. Strictly necessary cookies",
          body: "Session cookies that keep you signed in during your visit, and your language preference (ro/en/tr). These cannot be disabled without breaking core functionality (e.g. placing an order requires being signed in).",
        },
        {
          heading: "3. Push notifications",
          body: "If you enable order-status notifications, your browser creates a push subscription (not a cookie, but a similar storage technology) — you can disable it anytime from your browser settings.",
        },
      ],
    },
    tr: {
      title: "Çerez Bildirimi",
      lastUpdated: LAST_UPDATED,
      sections: [
        {
          heading: "1. Çerez nedir",
          body: "Çerezler, tarayıcınızda saklanan küçük metin dosyalarıdır. Apa Expres yalnızca kimlik doğrulama ve oturum yönetimi (Supabase Auth) için kesinlikle gerekli çerezler kullanır — üçüncü taraf pazarlama veya analiz çerezi kullanmıyoruz.",
        },
        {
          heading: "2. Kesinlikle gerekli çerezler",
          body: "Ziyaretiniz boyunca oturumunuzu açık tutan çerezler ve dil tercihiniz (ro/en/tr). Bunlar devre dışı bırakılırsa temel işlevler (örn. sipariş vermek için giriş yapmış olmak) çalışmaz.",
        },
        {
          heading: "3. Push bildirimleri",
          body: "Sipariş durum bildirimlerini açarsanız tarayıcınız bir push aboneliği oluşturur (çerez değildir ama benzer bir depolama teknolojisidir) — istediğiniz zaman tarayıcı ayarlarınızdan kapatabilirsiniz.",
        },
      ],
    },
  },
};
