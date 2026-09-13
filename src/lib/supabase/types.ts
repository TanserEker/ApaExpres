// Basitleştirilmiş veritabanı tipleri (Supabase CLI ile `supabase gen types typescript`
// çalıştırıp bu dosyanın yerine tam otomatik üretilen tipleri koyabilirsiniz — gerçek bir
// Supabase projesi bağlandıktan sonra bu adım README'de not edilmiştir).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

export type ZoneRow = {
  id: string;
  name: string;
  city: string;
  is_active: boolean;
  created_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  size_liters: number;
  unit_price: number;
  deposit_price: number;
  is_active: boolean;
  created_at: string;
};

export type PlanType = "one_time" | "subscription" | "credit_pack";

export type SubscriptionPlanRow = {
  id: string;
  plan_type: PlanType;
  frequency: 1 | 2 | 3 | null;
  pack_size: 10 | 15 | 20 | null;
  unit_price: number;
  total_price: number | null;
  is_active: boolean;
  created_at: string;
};

export type CustomerRow = {
  id: string;
  phone: string;
  name: string;
  auth_user_id: string | null;
  created_at: string;
};

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type CustomerSubscriptionRow = {
  id: string;
  customer_id: string;
  plan_id: string;
  frequency: 1 | 2 | 3;
  status: SubscriptionStatus;
  next_delivery_date: string | null;
  created_at: string;
};

export type CustomerCreditRow = {
  id: string;
  customer_id: string;
  credit_balance: number;
  updated_at: string;
};

export type CreditTransactionType = "purchase" | "consumption" | "adjustment";

export type CreditTransactionRow = {
  id: string;
  customer_id: string;
  type: CreditTransactionType;
  quantity: number;
  order_id: string | null;
  created_at: string;
};

export type DeliveryAddressRow = {
  id: string;
  customer_id: string;
  zone_id: string;
  block: string | null;
  floor: string | null;
  apartment: string | null;
  notes: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export type AdminRow = {
  id: string;
  auth_user_id: string;
  name: string;
  created_at: string;
};

export type OrderStatus = "received" | "preparing" | "on_the_way" | "delivered" | "cancelled";
export type PaymentMethod = "cash" | "card" | "credit_balance";

export type OrderRow = {
  id: string;
  customer_id: string;
  zone_id: string;
  address_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  total_amount: number;
  capacity_slot_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  created_at: string;
  delivered_at: string | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_snapshot: number;
  deposit_snapshot: number;
};

export type OrderStatusHistoryRow = {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string | null;
  changed_at: string;
  note: string | null;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentRow = {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string | null;
  provider_ref: string | null;
  amount: number;
  created_at: string;
};

export type VehicleRow = {
  id: string;
  zone_id: string;
  plate: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
};

export type DriverRow = {
  id: string;
  name: string;
  phone: string;
  zone_id: string;
  vehicle_id: string | null;
  auth_user_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type DriverAssignmentStatus = "assigned" | "picked_up" | "delivered" | "cancelled";

export type DriverAssignmentRow = {
  id: string;
  order_id: string;
  driver_id: string;
  vehicle_id: string;
  assigned_at: string;
  status: DriverAssignmentStatus;
};

export type CapacitySlotRow = {
  id: string;
  zone_id: string;
  date: string;
  slot_start: string;
  slot_end: string;
  max_orders: number;
  current_orders: number;
};

export type BottleStockMovementType =
  | "tedarikciden_alim"
  | "musteriye_teslim"
  | "musteriden_iade"
  | "tedarikciye_iade"
  | "adjustment";

export type BottleStockMovementRow = {
  id: string;
  type: BottleStockMovementType;
  quantity: number;
  date: string;
  related_order_id: string | null;
  notes: string | null;
  created_at: string;
};
