-- Görev 5: admin panelinin "sipariş onaylama" ve "kuryeye atama" ihtiyacı için
-- RPC'ler. Aynı desen: is_admin() içeride kontrol ediliyor (bkz. admin_adjust_credit),
-- bu yüzden authenticated client'tan (admin oturumuyla) çağrılabiliyor — admin
-- panelinin server action'ları service role'e gerek duymadan bunu kullanabilir.
-- (Katalog/kapasite CRUD'u gibi düz insert/update işlemleri için RPC'ye gerek yok,
-- onlar admin server action'larında service role ile doğrudan yapılıyor.)

create or replace function approve_order(
  p_order_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int;
begin
  if not is_admin() then
    raise exception 'Bu islem icin admin yetkisi gerekiyor.';
  end if;

  update orders set status = 'preparing'
    where id = p_order_id and status = 'received';

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Siparis bulunamadi veya zaten onaylanmis/iptal edilmis.';
  end if;

  insert into order_status_history (order_id, status, changed_by, note)
    values (p_order_id, 'preparing', auth.uid(), coalesce(p_note, 'Admin tarafindan onaylandi'));
end;
$$;

revoke execute on function approve_order(uuid, text) from public;
grant execute on function approve_order(uuid, text) to authenticated;

-- Kuryeye atama: driver_assignments'a yeni bir kayıt açar ve orders.driver_id/
-- vehicle_id'yi senkronlar (bkz. 0011'deki update_delivery_status'taki aynı not —
-- bu senkronizasyon olmadan sürücü kendi siparişini RLS ile göremez).
create or replace function assign_driver(
  p_order_id uuid,
  p_driver_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver drivers%rowtype;
  v_order orders%rowtype;
begin
  if not is_admin() then
    raise exception 'Bu islem icin admin yetkisi gerekiyor.';
  end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'Siparis bulunamadi.';
  end if;

  if v_order.status in ('delivered', 'cancelled') then
    raise exception 'Teslim edilmis/iptal edilmis siparise kurye atanamaz.';
  end if;

  select * into v_driver from drivers where id = p_driver_id and is_active = true;
  if not found then
    raise exception 'Surucu bulunamadi veya aktif degil.';
  end if;

  if v_driver.vehicle_id is null then
    raise exception 'Bu surucuye atanmis bir arac yok.';
  end if;

  insert into driver_assignments (order_id, driver_id, vehicle_id, status)
    values (p_order_id, v_driver.id, v_driver.vehicle_id, 'assigned');

  update orders set driver_id = v_driver.id, vehicle_id = v_driver.vehicle_id
    where id = p_order_id;

  insert into order_status_history (order_id, status, changed_by, note)
    values (p_order_id, v_order.status, auth.uid(), 'Kuryeye atandi: ' || v_driver.name);
end;
$$;

revoke execute on function assign_driver(uuid, uuid) from public;
grant execute on function assign_driver(uuid, uuid) to authenticated;
