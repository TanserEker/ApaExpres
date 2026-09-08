import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// SADECE sunucu tarafı, güvenilir kodlarda (server action/cron/webhook route'ları) kullanılır.
// Bu client RLS'yi tamamen atlar — asla tarayıcıya/istemciye sızdırılmamalıdır.
// Apa Expres iç sistemdir (müşteriye açık genel bir sipariş sitesi yok); admin/sürücü
// panelleri ile sipariş oluşturma akışlarının çoğu bu client üzerinden, kimlik doğrulaması
// yapılmış sunucu kodunda yürütülecek şekilde tasarlanmalıdır.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
