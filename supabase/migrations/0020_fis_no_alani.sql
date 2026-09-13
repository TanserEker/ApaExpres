-- Görev 9: fiş/fatura no alanı. README'deki plana göre (bkz. "Yasal gereklilikler"
-- - bon fiscal, e-Factura değil) her sipariş taşınabilir yazar kasadan çıkan bir
-- bon fiscal ile kapatılıyor; bu numara ödeme tahsil edildikten sonra admin
-- tarafından siparişe elle işleniyor (muhasebeye 2 günde bir iletilen fişlerle
-- eşleştirmek için).
alter table orders
  add column if not exists receipt_number text;

create index if not exists orders_receipt_number_idx on orders (receipt_number)
  where receipt_number is not null;
