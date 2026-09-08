-- Bir siparişin hangi sürücüye/araca atandığının geçmişi (orders.driver_id/vehicle_id
-- "güncel" atamayı tutar, bu tablo atama geçmişini/denetim izini tutar).

create table if not exists driver_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  driver_id uuid not null references drivers(id) on delete restrict,
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  status text not null default 'assigned'
    check (status in ('assigned', 'picked_up', 'delivered', 'cancelled'))
);

alter table driver_assignments enable row level security;

drop policy if exists "surucu kendi atamalarini gorebilir" on driver_assignments;
create policy "surucu kendi atamalarini gorebilir"
  on driver_assignments for select using (is_own_driver(driver_id));

-- Not: atama oluşturma/güncelleme (dispatch mantığı) service role ile yapılır.
