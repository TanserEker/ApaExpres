-- Görev 6: opsiyonel teslimat fotoğrafı (Supabase Storage). Yükleme tarayıcıdan
-- doğrudan (sürücünün oturumuyla) yapılır, sonra dönen storage path
-- update_delivery_status'a p_photo_path olarak geçirilir (bkz. src/app/[locale]/kurye).

alter table driver_assignments
  add column if not exists delivery_photo_path text;

-- Bucket private (public=false) — fotoğraflar sadece imzalı URL (signed URL) ile
-- görüntülenebilir, herkese açık bir CDN linki değil (müşteri kapı/koridor
-- fotoğrafı gibi kişisel alan içerebilir).
insert into storage.buckets (id, name, public)
  values ('teslimat-fotograflari', 'teslimat-fotograflari', false)
  on conflict (id) do nothing;

-- Yükleme yolu her zaman "{driver_id}/{assignment_id}.jpg" biçiminde olmalı — RLS
-- bunu (storage.foldername ile) klasör adının kendi driver id'siyle eşleştiğini
-- kontrol ederek zorunlu kılıyor.
drop policy if exists "surucu kendi klasorune fotograf yukleyebilir" on storage.objects;
create policy "surucu kendi klasorune fotograf yukleyebilir"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'teslimat-fotograflari'
    and (storage.foldername(name))[1] = (
      select id::text from drivers where auth_user_id = auth.uid()
    )
  );

drop policy if exists "surucu kendi fotograflarini gorebilir" on storage.objects;
create policy "surucu kendi fotograflarini gorebilir"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'teslimat-fotograflari'
    and (storage.foldername(name))[1] = (
      select id::text from drivers where auth_user_id = auth.uid()
    )
  );

drop policy if exists "admin tum teslimat fotograflarini gorebilir" on storage.objects;
create policy "admin tum teslimat fotograflarini gorebilir"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'teslimat-fotograflari' and is_admin());

-- update_delivery_status'a opsiyonel p_photo_path eklendi. Postgres'te fonksiyon
-- kimliği parametre imzasını da kapsadığı için CREATE OR REPLACE farklı sayıda
-- parametreli bir fonksiyonun YERİNİ ALMAZ (iki ayrı overload olarak kalır) — bu
-- yüzden eski 3 parametreli sürüm önce DROP ediliyor.
drop function if exists update_delivery_status(uuid, text, text);

create function update_delivery_status(
  p_assignment_id uuid,
  p_new_status text,
  p_note text default null,
  p_photo_path text default null
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

  if not (
    (v_assignment.status = 'assigned' and p_new_status in ('picked_up', 'cancelled')) or
    (v_assignment.status = 'picked_up' and p_new_status in ('delivered', 'cancelled'))
  ) then
    raise exception 'Gecersiz durum gecisi: % -> %', v_assignment.status, p_new_status;
  end if;

  update driver_assignments
    set status = p_new_status,
        delivery_photo_path = coalesce(p_photo_path, delivery_photo_path)
    where id = p_assignment_id;

  v_new_order_status := case p_new_status
    when 'picked_up' then 'on_the_way'
    when 'delivered' then 'delivered'
    when 'cancelled' then 'cancelled'
  end;

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

revoke execute on function update_delivery_status(uuid, text, text, text) from public;
grant execute on function update_delivery_status(uuid, text, text, text) to authenticated;
