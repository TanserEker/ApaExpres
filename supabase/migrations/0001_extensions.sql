-- Temel eklentiler ve tüm migration'larda kullanılan ortak yardımcılar.

create extension if not exists "pgcrypto";

-- `updated_at` sütunu olan tablolarda otomatik güncelleme için ortak trigger fonksiyonu.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
