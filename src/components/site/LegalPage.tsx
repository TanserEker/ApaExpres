import type { LegalDoc } from "@/lib/legal/content";

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-[#0B4F8A]">{doc.title}</h1>
        <p className="text-xs text-[#0A2540]/50">Son güncelleme / Ultima actualizare: {doc.lastUpdated}</p>
      </div>
      <div className="flex flex-col gap-5">
        {doc.sections.map((s) => (
          <div key={s.heading}>
            <h2 className="mb-1 font-medium text-[#0A2540]">{s.heading}</h2>
            <p className="text-sm leading-relaxed text-[#0A2540]/75">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
