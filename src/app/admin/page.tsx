// Admin panelinin başlangıç noktası. Henüz gerçek bir Supabase projesi bağlanmadığı için
// (bkz. proje kök README.md) bilerek boş/placeholder bırakıldı — Supabase bağlanınca
// sipariş listesi, kapasite/slot yönetimi ve filo ataması buraya eklenecek.
export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center">
      <h1 className="text-2xl font-semibold">Apa Expres — Admin Paneli</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Bu sayfa henüz boş bir iskelet. Supabase projesi bağlandıktan sonra sipariş, filo ve
        kapasite yönetimi buraya eklenecek (bkz. proje kök README.md).
      </p>
    </div>
  );
}
