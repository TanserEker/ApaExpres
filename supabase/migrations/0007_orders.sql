-- Siparişler ve ilişkili tablolar. Sipariş OLUŞTURMA her zaman service role ile,
-- sunucu tarafı bir Server Action/RPC üzerinden yapılır (kapasite kontrolü + kredi/ödeme
-- doğrulama + fiyat snapshot'lama tek transaction'da) — bkz. deeftech-restoran-saas'taki
-- create_order deseni. Buradaki policy'ler sadece görüntüleme (select) içindir.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  zone_id uuid not null references zones(id) on delete restrict,
  address_id uuid not null references delivery_addresses(id) on delete restrict,
  status text not null default 'received'
    check (status in ('received', 'preparing', 'on_the_way', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('cash', 'card', 'credit_balance')),
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  capacity_slot_id uuid not null references capacity_slots(id) on delete restrict,
  driver_id uuid references drivers(id) on delete set null,
  vehicle_id uuid references vehicles(id) on delete set null,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

-- 0004_subscriptions_credits.sql'de FK'siz oluşturulan credit_transactions.order_id için
-- şimdi (orders tablosu var olduğuna göre) foreign key kısıtını ekliyoruz.
alter table credit_transactions
  add constraint credit_transactions_order_id_fkey
  foreign key (order_id) references orders(id) on delete set null;

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price_snapshot numeric(10,2) not null,
  deposit_snapshot numeric(10,2) not null default 0
);

create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null
    check (status in ('received', 'preparing', 'on_the_way', 'delivered', 'cancelled')),
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now(),
  note text
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method text not null check (method in ('cash', 'card', 'credit_balance')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider text, -- örn. ileride entegre edilecek bir ödeme sağlayıcısı adı
  provider_ref text, -- sağlayıcı tarafındaki işlem referansı
  amount numeric(10,2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table payments enable row level security;

drop policy if exists "musteri kendi siparislerini gorebilir" on orders;
create policy "musteri kendi siparislerini gorebilir"
  on orders for select using (is_own_customer(customer_id));

drop policy if exists "surucu kendine atanan siparisleri gorebilir" on orders;
create policy "surucu kendine atanan siparisleri gorebilir"
  on orders for select using (is_own_driver(driver_id));

drop policy if exists "ilgili taraf siparis kalemlerini gorebilir" on order_items;
create policy "ilgili taraf siparis kalemlerini gorebilir"
  on order_items for select using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (is_own_customer(o.customer_id) or is_own_driver(o.driver_id))
    )
  );

drop policy if exists "ilgili taraf siparis gecmisini gorebilir" on order_status_history;
create policy "ilgili taraf siparis gecmisini gorebilir"
  on order_status_history for select using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (is_own_customer(o.customer_id) or is_own_driver(o.driver_id))
    )
  );

drop policy if exists "musteri kendi odemelerini gorebilir" on payments;
create policy "musteri kendi odemelerini gorebilir"
  on payments for select using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and is_own_customer(o.customer_id)
    )
  );

-- Not: insert/update policy'si yok — sipariş oluşturma/güncelleme, durum geçişi ve
-- ödeme kaydı her zaman service role ile (server action/RPC) yapılır.
