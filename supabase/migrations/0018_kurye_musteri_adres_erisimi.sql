-- Görev 6: kurye arayüzü, kendine atanan siparişi teslim edebilmek için müşterinin
-- adını/telefonunu ve teslimat adresini görebilmeli. 0003/0007'deki mevcut
-- policy'ler bunu kapsamıyordu (customers/delivery_addresses sadece müşterinin
-- kendisine açıktı) — bu migration sürücüye, SADECE kendine atanmış bir siparişin
-- ilişkili olduğu müşteri/adres için, dar kapsamlı bir select policy'si ekliyor.

drop policy if exists "surucu atanan siparisin musterisini gorebilir" on customers;
create policy "surucu atanan siparisin musterisini gorebilir"
  on customers for select using (
    exists (
      select 1 from orders o
      where o.customer_id = customers.id
        and is_own_driver(o.driver_id)
    )
  );

drop policy if exists "surucu atanan siparisin adresini gorebilir" on delivery_addresses;
create policy "surucu atanan siparisin adresini gorebilir"
  on delivery_addresses for select using (
    exists (
      select 1 from orders o
      where o.address_id = delivery_addresses.id
        and is_own_driver(o.driver_id)
    )
  );
