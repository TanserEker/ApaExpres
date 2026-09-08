-- Boş/dolu bidon stok hareketleri (tedarikçiden alım, müşteriye teslim, müşteriden iade,
-- tedarikçiye iade, manuel düzeltme). Tamamen iç muhasebe/stok takibi — müşteriden depozito
-- alınmadığı için bu tablo şirketin taşıdığı bidon riskini/sermayesini izlemek için kritik.

create table if not exists bottle_stock_movements (
  id uuid primary key default gen_random_uuid(),
  type text not null check (
    type in (
      'tedarikciden_alim',
      'musteriye_teslim',
      'musteriden_iade',
      'tedarikciye_iade',
      'adjustment'
    )
  ),
  quantity int not null, -- yöne göre işaret (alım/iade pozitif, teslim negatif vb.) — iş kuralı uygulama katmanında netleşir
  date date not null default current_date,
  related_order_id uuid references orders(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

alter table bottle_stock_movements enable row level security;

-- Not: hiçbir anon/authenticated policy'si tanımlanmadı — bu tablo tamamen iç
-- muhasebe verisi, sadece admin paneli (service role) tarafından okunur/yazılır.
