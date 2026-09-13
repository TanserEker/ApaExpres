-- Görev 3: müşteri sipariş akışı. `deeftech-restoran-saas`'taki create_order deseniyle
-- aynı yaklaşım — SECURITY DEFINER fonksiyon, anon/authenticated tablolara doğrudan
-- insert edemiyor (bkz. 0002/0007), sadece bu fonksiyonlar üzerinden, kontrollü şekilde
-- sipariş/abonelik oluşturabiliyor. customer_id her zaman auth.uid() üzerinden sunucu
-- tarafında bulunuyor, istemciden parametre olarak alınmıyor (kimlik sahteciliğini
-- engeller).

-- Tek seferlik sipariş oluşturma. Kapasite kontrolü (1 saatlik hızlı teslimat vaadi,
-- bkz. 0006_capacity_slots.sql) ve fiyat snapshot'lama tek transaction'da yapılır.
create or replace function create_order(
  p_address_id uuid,
  p_payment_method text, -- 'cash' | 'card' (bkz. README - v1 kapida odeme, sadece kayit)
  p_items jsonb -- [{"product_id": "...", "quantity": 2}, ...] - adet her zaman 2'nin kati olmali
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer customers%rowtype;
  v_address delivery_addresses%rowtype;
  v_zone zones%rowtype;
  v_slot capacity_slots%rowtype;
  v_order_id uuid;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_product products%rowtype;
  v_quantity int;
  v_today_ro date;
  v_hour_ro int;
  v_slot_start time;
  v_slot_end time;
  -- Gecici varsayilan saatlik kapasite - Görev 5'te admin panelinden yönetilecek
  -- (bkz. capacity_slots yorumu); su an icin tek kurye varsayimiyla sabit.
  v_slot_default_max_orders constant int := 8;
begin
  if p_payment_method not in ('cash', 'card') then
    raise exception 'Gecersiz odeme yontemi.';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Sepet bos.';
  end if;

  select * into v_customer from customers where auth_user_id = auth.uid();
  if not found then
    raise exception 'Musteri kaydi bulunamadi.';
  end if;

  select * into v_address from delivery_addresses
    where id = p_address_id and customer_id = v_customer.id;
  if not found then
    raise exception 'Adres bulunamadi veya size ait degil.';
  end if;

  select * into v_zone from zones where id = v_address.zone_id and is_active = true;
  if not found then
    raise exception 'Bolge artik aktif degil.';
  end if;

  -- Saat/tarih hesabi her zaman Cosmopolis'in bulundugu Europe/Bucharest saat
  -- dilimine gore yapilir - sunucunun kendi saat dilimi ne olursa olsun.
  v_today_ro := (now() at time zone 'Europe/Bucharest')::date;
  v_hour_ro := extract(hour from (now() at time zone 'Europe/Bucharest'))::int;

  if v_hour_ro < 9 or v_hour_ro >= 20 then
    raise exception 'Su an teslimat saatleri disinda (09:00-20:00).';
  end if;

  v_slot_start := make_time(v_hour_ro, 0, 0);
  v_slot_end := make_time(v_hour_ro + 1, 0, 0);

  -- Slot yoksa olustur (ilk siparis), varsa dokunma - admin max_orders'i elle
  -- degistirmis olabilir.
  insert into capacity_slots (zone_id, date, slot_start, slot_end, max_orders)
    values (v_zone.id, v_today_ro, v_slot_start, v_slot_end, v_slot_default_max_orders)
    on conflict (zone_id, date, slot_start, slot_end) do nothing;

  select * into v_slot from capacity_slots
    where zone_id = v_zone.id and date = v_today_ro
      and slot_start = v_slot_start and slot_end = v_slot_end
    for update;

  if v_slot.current_orders >= v_slot.max_orders then
    raise exception 'Bu saat dilimi icin kapasite doldu, lutfen birazdan tekrar deneyin.';
  end if;

  insert into orders (customer_id, zone_id, address_id, status, payment_method, total_amount, capacity_slot_id)
    values (v_customer.id, v_zone.id, v_address.id, 'received', p_payment_method, 0, v_slot.id)
    returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::int;
    if v_quantity <= 0 or v_quantity % 2 <> 0 then
      raise exception '5L urunler 2 adet ve katlari halinde siparis edilebilir.';
    end if;

    select * into v_product from products
      where id = (v_item->>'product_id')::uuid and is_active = true
      for update;

    if not found then
      raise exception 'Urun bulunamadi veya artik satista degil.';
    end if;

    insert into order_items (order_id, product_id, quantity, unit_price_snapshot, deposit_snapshot)
      values (v_order_id, v_product.id, v_quantity, v_product.unit_price, v_product.deposit_price);

    v_total := v_total + (v_product.unit_price * v_quantity);
  end loop;

  v_total := v_total + v_zone.delivery_fee;

  update orders set total_amount = v_total where id = v_order_id;
  update capacity_slots set current_orders = current_orders + 1 where id = v_slot.id;

  insert into order_status_history (order_id, status, changed_by, note)
    values (v_order_id, 'received', auth.uid(), 'Siparis olusturuldu');

  -- v1: kapida odeme (nakit/kart) - sadece kayit, gercek tahsilat entegrasyonu yok
  -- (bkz. README "Kesin kararlar").
  insert into payments (order_id, method, status, amount)
    values (v_order_id, p_payment_method, 'pending', v_total);

  return jsonb_build_object('order_id', v_order_id, 'total_amount', v_total);
end;
$$;

revoke execute on function create_order(uuid, text, jsonb) from public;
grant execute on function create_order(uuid, text, jsonb) to authenticated;

-- Abonelik SEÇİMİ: müşteri checkout'ta bir abonelik planına kaydolabilir. Kredi
-- bakiyesi/plan yönetimi (duraklat/iptal/kredi yükle) kapsam dışı - bkz. GOREVLER.md
-- Görev 4 ("Abonelik + kredi UI"), o gorev src/app/actions/subscriptions.ts'i kuracak.
create or replace function select_subscription_plan(
  p_plan_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer customers%rowtype;
  v_plan subscription_plans%rowtype;
  v_subscription_id uuid;
begin
  select * into v_customer from customers where auth_user_id = auth.uid();
  if not found then
    raise exception 'Musteri kaydi bulunamadi.';
  end if;

  select * into v_plan from subscription_plans
    where id = p_plan_id and plan_type = 'subscription' and is_active = true;
  if not found then
    raise exception 'Abonelik plani bulunamadi veya artik aktif degil.';
  end if;

  insert into customer_subscriptions (customer_id, plan_id, frequency, status, next_delivery_date)
    values (v_customer.id, v_plan.id, v_plan.frequency, 'active', current_date + 1)
    returning id into v_subscription_id;

  return jsonb_build_object('subscription_id', v_subscription_id);
end;
$$;

revoke execute on function select_subscription_plan(uuid) from public;
grant execute on function select_subscription_plan(uuid) to authenticated;
