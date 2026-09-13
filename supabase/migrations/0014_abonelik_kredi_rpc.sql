-- Görev 4: Abonelik + kredi. Aynı desen (SECURITY DEFINER, service role gerekmeden
-- authenticated client'tan çağrılabilir) — bkz. 0013'teki create_order/select_subscription_plan.
--
-- ÖNEMLİ VARSAYIM (Tanser/Hakan onayı bekliyor): customer_credits.credit_balance
-- "kalan bidon sayısı" (RON değil). Bu yüzden kredi ile ödenen bir siparişte suyun
-- kendisi zaten ödenmiş sayılıyor (credit_pack alımında peşin ödendi) — sadece
-- teslimat ücreti (varsa) kapıda tahsil ediliyor. create_order'ın credit_balance
-- dalı bu varsayıma göre yazıldı; iş kuralı netleşince (örn. abonelikte teslimat
-- ücreti de kredi kapsamına alınabilir) burası güncellenmeli.

-- Kredi paketi satın alma (subscription_plans.plan_type = 'credit_pack').
-- Ödemenin kendisi (nakit/kart) şu an sadece kayıt seviyesinde (bkz. README "Kesin
-- kararlar") — bu RPC parayı değil, bidon kredisini hesaba yazıyor.
create or replace function purchase_credit_pack(
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
  v_new_balance int;
begin
  select * into v_customer from customers where auth_user_id = auth.uid();
  if not found then
    raise exception 'Musteri kaydi bulunamadi.';
  end if;

  select * into v_plan from subscription_plans
    where id = p_plan_id and plan_type = 'credit_pack' and is_active = true;
  if not found then
    raise exception 'Kredi paketi bulunamadi veya artik aktif degil.';
  end if;

  insert into customer_credits (customer_id, credit_balance)
    values (v_customer.id, v_plan.pack_size)
    on conflict (customer_id) do update
      set credit_balance = customer_credits.credit_balance + excluded.credit_balance
    returning credit_balance into v_new_balance;

  insert into credit_transactions (customer_id, type, quantity, order_id)
    values (v_customer.id, 'purchase', v_plan.pack_size, null);

  return jsonb_build_object('credit_balance', v_new_balance);
end;
$$;

revoke execute on function purchase_credit_pack(uuid) from public;
grant execute on function purchase_credit_pack(uuid) to authenticated;

-- Müşteri kendi aboneliğini duraklatabilir/iptal edebilir/tekrar aktif edebilir.
-- Plan değiştirme veya yeni abonelik oluşturma burada değil (bkz. select_subscription_plan).
create or replace function update_subscription_status(
  p_subscription_id uuid,
  p_status text -- 'active' | 'paused' | 'cancelled'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_updated int;
begin
  if p_status not in ('active', 'paused', 'cancelled') then
    raise exception 'Gecersiz durum: %', p_status;
  end if;

  select id into v_customer_id from customers where auth_user_id = auth.uid();
  if v_customer_id is null then
    raise exception 'Musteri kaydi bulunamadi.';
  end if;

  update customer_subscriptions
    set status = p_status
    where id = p_subscription_id and customer_id = v_customer_id;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Abonelik bulunamadi veya size ait degil.';
  end if;
end;
$$;

revoke execute on function update_subscription_status(uuid, text) from public;
grant execute on function update_subscription_status(uuid, text) to authenticated;

-- Admin: kredi düzeltmesi (manuel yükleme/düşme - örn. telefonla yapılan bir
-- paket satışı, iade, hata düzeltmesi). customer_credits.credit_balance >= 0
-- check constraint'i (bkz. 0004) zaten bakiyeyi negatife düşürmeyi engelliyor.
create or replace function admin_adjust_credit(
  p_customer_id uuid,
  p_delta int,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance int;
begin
  if not is_admin() then
    raise exception 'Bu islem icin admin yetkisi gerekiyor.';
  end if;

  if p_delta = 0 then
    raise exception 'Delta sifir olamaz.';
  end if;

  insert into customer_credits (customer_id, credit_balance)
    values (p_customer_id, greatest(p_delta, 0))
    on conflict (customer_id) do update
      set credit_balance = customer_credits.credit_balance + p_delta
    returning credit_balance into v_new_balance;

  insert into credit_transactions (customer_id, type, quantity, order_id)
    values (p_customer_id, 'adjustment', p_delta, null);

  return jsonb_build_object('credit_balance', v_new_balance, 'note', p_note);
end;
$$;

revoke execute on function admin_adjust_credit(uuid, int, text) from public;
grant execute on function admin_adjust_credit(uuid, int, text) to authenticated;

-- Admin: herhangi bir müşterinin aboneliğini yönetebilir (örn. müşteri telefonla
-- iptal isterse).
create or replace function admin_update_subscription(
  p_subscription_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'Bu islem icin admin yetkisi gerekiyor.';
  end if;

  if p_status not in ('active', 'paused', 'cancelled') then
    raise exception 'Gecersiz durum: %', p_status;
  end if;

  update customer_subscriptions set status = p_status where id = p_subscription_id;
end;
$$;

revoke execute on function admin_update_subscription(uuid, text) from public;
grant execute on function admin_update_subscription(uuid, text) to authenticated;

-- create_order'a 'credit_balance' ödeme yolu ekleniyor (CREATE OR REPLACE - imza
-- ayni kaliyor, bkz. 0013). Kredi ile ödemede su zaten pesin odenmis sayildigi icin
-- (bkz. dosya basindaki VARSAYIM notu) sadece teslimat ucreti kapida tahsil ediliyor;
-- bidon adedi kadar kredi dusuluyor.
create or replace function create_order(
  p_address_id uuid,
  p_payment_method text, -- 'cash' | 'card' | 'credit_balance'
  p_items jsonb
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
  v_total_quantity int := 0;
  v_today_ro date;
  v_hour_ro int;
  v_slot_start time;
  v_slot_end time;
  v_slot_default_max_orders constant int := 8;
  v_credit_balance int;
begin
  if p_payment_method not in ('cash', 'card', 'credit_balance') then
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

  v_today_ro := (now() at time zone 'Europe/Bucharest')::date;
  v_hour_ro := extract(hour from (now() at time zone 'Europe/Bucharest'))::int;

  if v_hour_ro < 9 or v_hour_ro >= 20 then
    raise exception 'Su an teslimat saatleri disinda (09:00-20:00).';
  end if;

  v_slot_start := make_time(v_hour_ro, 0, 0);
  v_slot_end := make_time(v_hour_ro + 1, 0, 0);

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

    v_total_quantity := v_total_quantity + v_quantity;
    v_total := v_total + (v_product.unit_price * v_quantity);
  end loop;

  if p_payment_method = 'credit_balance' then
    select credit_balance into v_credit_balance from customer_credits
      where customer_id = v_customer.id for update;

    if v_credit_balance is null or v_credit_balance < v_total_quantity then
      raise exception 'Yetersiz kredi bakiyesi (gerekli: %, mevcut: %).', v_total_quantity, coalesce(v_credit_balance, 0);
    end if;

    update customer_credits set credit_balance = credit_balance - v_total_quantity
      where customer_id = v_customer.id;

    insert into credit_transactions (customer_id, type, quantity, order_id)
      values (v_customer.id, 'consumption', -v_total_quantity, v_order_id);

    -- Su kredi ile odendigi icin siparis toplami sadece teslimat ucreti.
    v_total := v_zone.delivery_fee;
  else
    v_total := v_total + v_zone.delivery_fee;
  end if;

  update orders set total_amount = v_total where id = v_order_id;
  update capacity_slots set current_orders = current_orders + 1 where id = v_slot.id;

  insert into order_status_history (order_id, status, changed_by, note)
    values (v_order_id, 'received', auth.uid(), 'Siparis olusturuldu');

  if v_total > 0 then
    insert into payments (order_id, method, status, amount)
      values (v_order_id, case when p_payment_method = 'credit_balance' then 'cash' else p_payment_method end, 'pending', v_total);
  end if;

  return jsonb_build_object('order_id', v_order_id, 'total_amount', v_total);
end;
$$;
