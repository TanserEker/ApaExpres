"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";

// aycabayramoglu/src/components/admin/AdminShell.tsx ile aynı desen: masaüstünde
// sabit iki-sütun, mobilde açılır/kapanır (off-canvas) sidebar.
export default function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0A2540]">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && (
        <div
          aria-hidden="true"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar adminName={adminName} onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 overflow-x-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
