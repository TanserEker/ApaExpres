"use client";

export default function TopBar({ adminName, onMenuClick }: { adminName: string; onMenuClick: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-[#0A2540]/10 bg-white px-4 py-3 md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Menüyü aç"
        className="rounded p-1.5 text-[#0A2540] md:hidden"
      >
        ☰
      </button>
      <span className="text-sm text-[#0A2540]/70">{adminName}</span>
    </header>
  );
}
