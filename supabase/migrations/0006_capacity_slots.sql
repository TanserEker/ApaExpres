-- Bölge bazlı teslimat kapasitesi (bir tarih/saat aralığında kaç sipariş kabul edilebilir).
-- 1 saatlik hızlı teslimat vaadinin arka planda kapasite kontrolüyle korunması için kullanılır.

create table if not exists capacity_slots (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones(id) on delete cascade,
  date date not null,
  slot_start time not null,
  slot_end time not null,
  max_orders int not null check (max_orders > 0),
  current_orders int not null default 0 check (current_orders >= 0),
  constraint capacity_slots_slot_end_after_start check (slot_end > slot_start),
  constraint capacity_slots_not_over_capacity check (current_orders <= max_orders),
  unique (zone_id, date, slot_start, slot_end)
);

alter table capacity_slots enable row level security;

-- Müşterinin sipariş verirken uygun slotu seçebilmesi için sadece giriş yapmış
-- kullanıcılara açık (anon'a değil — sipariş akışı zaten girişten sonra başlar).
drop policy if exists "giris yapan musteri slotlari gorebilir" on capacity_slots;
create policy "giris yapan musteri slotlari gorebilir"
  on capacity_slots for select to authenticated using (true);

-- Not: current_orders güncellemesi (kapasite düşürme) ve slot oluşturma/silme
-- sadece service role ile, sipariş oluşturma RPC'si içinde atomik yapılır.
