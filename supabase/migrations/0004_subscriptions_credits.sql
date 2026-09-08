-- Müşteri abonelikleri, kredi bakiyesi ve kredi hareketleri.
-- Not: `credit_transactions.order_id` şu an FK'siz bir uuid sütunu olarak tanımlanıyor;
-- `orders` tablosu henüz mevcut değil (bkz. 0007_orders.sql). Foreign key kısıtı,
-- orders tablosu oluşturulduktan sonra 0007'de ALTER TABLE ile eklenir.

create table if not exists customer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id) on delete restrict,
  frequency int not null check (frequency in (1, 2, 3)), -- haftada kaç teslimat
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  next_delivery_date date,
  created_at timestamptz not null default now()
);

create table if not exists customer_credits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references customers(id) on delete cascade,
  credit_balance int not null default 0 check (credit_balance >= 0), -- kalan bidon sayısı
  updated_at timestamptz not null default now()
);

drop trigger if exists customer_credits_set_updated_at on customer_credits;
create trigger customer_credits_set_updated_at
  before update on customer_credits
  for each row execute function set_updated_at();

create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  type text not null check (type in ('purchase', 'consumption', 'adjustment')),
  quantity int not null, -- purchase/adjustment(+) pozitif, consumption negatif olabilir
  order_id uuid, -- bkz. üstteki not: FK kısıtı 0007_orders.sql'de eklenir
  created_at timestamptz not null default now()
);

alter table customer_subscriptions enable row level security;
alter table customer_credits enable row level security;
alter table credit_transactions enable row level security;

-- Mutasyonlar (oluşturma/duraklatma/iptal, kredi yükleme/düşme) her zaman iş kuralı
-- gerektirdiği için (plan doğrulama, ödeme, stok vb.) service role ile server action/RPC
-- üzerinden yapılır — bkz. deeftech-restoran-saas'taki orders deseni. Buradaki policy'ler
-- sadece müşterinin PWA'da kendi verisini görebilmesi (select) içindir.

drop policy if exists "musteri kendi aboneliklerini gorebilir" on customer_subscriptions;
create policy "musteri kendi aboneliklerini gorebilir"
  on customer_subscriptions for select using (is_own_customer(customer_id));

drop policy if exists "musteri kendi kredi bakiyesini gorebilir" on customer_credits;
create policy "musteri kendi kredi bakiyesini gorebilir"
  on customer_credits for select using (is_own_customer(customer_id));

drop policy if exists "musteri kendi kredi hareketlerini gorebilir" on credit_transactions;
create policy "musteri kendi kredi hareketlerini gorebilir"
  on credit_transactions for select using (is_own_customer(customer_id));
