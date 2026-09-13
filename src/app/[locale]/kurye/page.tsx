// Kurye panelinin başlangıç noktası — admin/page.tsx ile aynı mantık: bilerek boş
// bırakıldı, asıl arayüz (atanan siparişler, durum güncelleme) Görev 6'da eklenecek.
// Buraya sadece giriş yapmış bir sürücü ulaşabilir (bkz. proxy.ts guard'ı).
export default function DriverDashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center">
      <h1 className="text-2xl font-semibold text-[#0B4F8A]">
        Apa Expres — Kurye Paneli
      </h1>
      <p className="max-w-md text-[#0A2540]/70">
        Bu sayfa henüz boş bir iskelet. Atanan siparişler ve durum güncelleme
        Görev 6&apos;da buraya eklenecek.
      </p>
    </div>
  );
}
