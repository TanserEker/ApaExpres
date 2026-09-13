"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/actions/admin-auth";

// aycabayramoglu/src/components/admin/Sidebar.tsx ile aynı "klasör deseni" (route
// listesi + aktif link vurgusu + alt kısımda çıkış formu) — ikon kütüphanesi
// (lucide-react) bu projede yok, sade metin linkleriyle tutuldu.
const LINKS = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/siparisler", label: "Siparişler" },
  { href: "/admin/kuryeler", label: "Kuryeler" },
  { href: "/admin/katalog", label: "Katalog" },
  { href: "/admin/kapasite", label: "Kapasite" },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col bg-[#0A2540] text-white
        transition-transform duration-200 ease-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:static md:min-h-screen md:translate-x-0`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-6">
        <Link href="/admin" onClick={onClose} className="text-lg font-semibold">
          Apa Expres
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Menüyü kapat"
          className="text-white/60 md:hidden"
        >
          ✕
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-[#3EC1E0] font-medium text-[#0A2540]" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAdmin} className="border-t border-white/10 px-3 py-4">
        <button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/10">
          Çıkış yap
        </button>
      </form>
    </aside>
  );
}
