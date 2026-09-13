-- FAZ 1 / Görev 1: auth.users -> customers/drivers rol bağlaması zaten 0003/0005'te
-- kuruldu (auth_user_id + is_own_customer()/is_own_driver()). Bu migration üçüncü rolü
-- (admin) ekliyor ve sürücü için gerçek bir durum güncelleme yazma yolu açıyor.
--
-- Admin, müşteri/sürücü self-servis kaydı gibi kendi kendine kayıt OLMAZ (bkz. README
-- "İç sistem mantığı") — admin hesabı Supabase Auth'ta (dashboard/service role ile)
-- oluşturulup bu tabloya elle/service role ile eklenir. Bu yüzden burada sadece
-- "kendi kaydını görebilir" select policy'si var, insert/update policy'si yok.
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- is_own_customer()/is_own_driver() ile aynı desen (bkz. 0003/0005) — SECURITY DEFINER,
-- RLS'yi kendi üzerinde çalıştırmadığı için (aycabayramoglu'daki "infinite recursion"
-- dersine bkz.) sonsuz döngüye girmez.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins
    where auth_user_id = auth.uid()
  );
$$;

revoke execute on function is_admin() from anon;

alter table admins enable row level security;

drop policy if exists "admin kendi kaydini gorebilir" on admins;
create policy "admin kendi kaydini gorebilir"
  on admins for select using (auth_user_id = auth.uid());

-- Not: admin panelinin (Görev 5) diğer tablolardaki veriye nasıl erişeceği bilerek
-- burada karara bağlanmadı — README'nin "İç sistem mantığı" bölümüne göre admin
-- paneli service role ile (src/lib/supabase/service.ts) çalışacak şekilde
-- tasarlanıyor, yani is_admin() burada asıl olarak (a) middleware'de "bu kullanıcı
-- admin mi" kontrolü ve (b) ileride ihtiyaç duyulursa ek RLS policy'leri için temel
-- olarak duruyor; her tabloya şimdiden "admin her şeyi yapabilir" policy'si eklemek
-- Görev 5'in kapsamı.

-- =========================================================
-- Sürücü: kendine atanan siparişin durumunu güncelleyebilme (assigned -> picked_up ->
-- delivered, veya iptal). Bu, "her rol sadece kendi kapsamındaki veriyi görüp
-- değiştirebiliyor" kabul kriterinin sürücü tarafı — driver_assignments/orders/
-- order_status_history'yi tek transaction'da tutarlı güncellediği için (create_order
-- deseniyle aynı mantık) raw bir UPDATE policy yerine SECURITY DEFINER RPC olarak
-- kuruldu. Görev 6 (kurye arayüzü) bu fonksiyonu çağıracak arayüzü ekleyecek.
create or replace function update_delivery_status(
  p_assignment_id uuid,
  p_new_status text, -- 'picked_up' | 'delivered' | 'cancelled'
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment driver_assignments%rowtype;
  v_driver_id uuid;
  v_new_order_status text;
begin
  if p_new_status not in ('picked_up', 'delivered', 'cancelled') then
    raise exception 'Gecersiz durum: %', p_new_status;
  end if;

  select id into v_driver_id from drivers where auth_user_id = auth.uid();
  if v_driver_id is null then
    raise exception 'Bu islem icin surucu girisi gerekiyor.';
  end if;

  select * into v_assignment from driver_assignments
    where id = p_assignment_id and driver_id = v_driver_id
    for update;

  if not found then
    raise exception 'Atama bulunamadi veya size ait degil.';
  end if;

  -- Geçerli durum geçişleri: assigned->picked_up, picked_up->delivered,
  -- assigned/picked_up->cancelled. Aynı durumun tekrar gönderilmesi veya geriye
  -- doğru geçiş reddedilir.
  if not (
    (v_assignment.status = 'assigned' and p_new_status in ('picked_up', 'cancelled')) or
    (v_assignment.status = 'picked_up' and p_new_status in ('delivered', 'cancelled'))
  ) then
    raise exception 'Gecersiz durum gecisi: % -> %', v_assignment.status, p_new_status;
  end if;

  update driver_assignments set status = p_new_status where id = p_assignment_id;

  v_new_order_status := case p_new_status
    when 'picked_up' then 'on_the_way'
    when 'delivered' then 'delivered'
    when 'cancelled' then 'cancelled'
  end;

  -- driver_id/vehicle_id de burada senkronlanıyor: 0008_driver_assignments.sql'e göre
  -- orders.driver_id "güncel" atamayı tutması gereken alan, ama admin paneli (Görev 5)
  -- henüz bu senkronizasyonu yapan bir "atama oluştur" akışına sahip değil. Burada
  -- eksik bırakılırsa sürücünün orders üzerindeki "surucu kendine atanan siparisleri
  -- gorebilir" (is_own_driver(driver_id)) select policy'si hiç eşleşmez ve sürücü
  -- durumunu güncellediği siparişi bile göremez.
  update orders
    set status = v_new_order_status,
        driver_id = v_assignment.driver_id,
        vehicle_id = v_assignment.vehicle_id,
        delivered_at = case when p_new_status = 'delivered' then now() else delivered_at end
    where id = v_assignment.order_id;

  insert into order_status_history (order_id, status, changed_by, note)
    values (v_assignment.order_id, v_new_order_status, auth.uid(), p_note);
end;
$$;

revoke execute on function update_delivery_status(uuid, text, text) from public;
grant execute on function update_delivery_status(uuid, text, text) to authenticated;
