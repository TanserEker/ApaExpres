-- Görev 7: PWA + opsiyonel web push. Web Push (VAPID) standardı — endpoint/keys
-- tarayıcının PushManager.subscribe() çağrısından gelir (bkz.
-- src/lib/webPushClient.ts). Bir kullanıcı/kurye birden fazla cihazdan abone
-- olabileceği için customer_id/driver_id + endpoint üzerinde tekillik var,
-- ikisi birden null olamaz (admin şu an push almıyor, sadece müşteri/sürücü).
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  driver_id uuid references drivers(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now(),
  constraint push_subscriptions_owner_check check (
    (customer_id is not null and driver_id is null) or
    (customer_id is null and driver_id is not null)
  ),
  unique (endpoint)
);

alter table push_subscriptions enable row level security;

drop policy if exists "musteri kendi push aboneligini yonetir" on push_subscriptions;
create policy "musteri kendi push aboneligini yonetir"
  on push_subscriptions for all
  using (customer_id is not null and is_own_customer(customer_id))
  with check (customer_id is not null and is_own_customer(customer_id));

drop policy if exists "surucu kendi push aboneligini yonetir" on push_subscriptions;
create policy "surucu kendi push aboneligini yonetir"
  on push_subscriptions for all
  using (driver_id is not null and is_own_driver(driver_id))
  with check (driver_id is not null and is_own_driver(driver_id));

-- Not: bildirim GÖNDERME (web-push kütüphanesiyle) her zaman sunucu tarafında
-- (server action, service role) yapılıyor - bu tabloya sadece abonelik
-- kayıtları için erişiliyor, gönderim mantığı bkz. src/lib/web-push.ts.
