import { logoutAdmin } from "@/app/actions/admin-auth";

// Admin panelinin başlangıç noktası. Henüz gerçek bir Supabase projesi bağlanmadığı için
// (bkz. proje kök README.md) bilerek boş/placeholder bırakıldı — Supabase bağlanınca
// sipariş listesi, kapasite/slot yönetimi ve filo ataması buraya eklenecek (Görev 5).
// Giriş/kimlik doğrulama artık çalışıyor (bkz. proxy.ts + 0011_admin_rolu_ve_rls.sql) —
// bu sayfaya sadece admins tablosunda kaydı olan, giriş yapmış kullanıcılar ulaşabilir.
export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-semibold">Apa Expres — Admin Paneli</h1>
      <p className="max-w-md text-white/70">
        Bu sayfa henüz boş bir iskelet. Sipariş, filo ve kapasite yönetimi
        Görev 5&apos;te buraya eklenecek (bkz. proje kök README.md).
      </p>
      <form action={logoutAdmin}>
        <button
          type="submit"
          className="rounded border border-white/30 px-4 py-2 text-sm hover:bg-white/10"
        >
          Çıkış yap
        </button>
      </form>
    </div>
  );
}
