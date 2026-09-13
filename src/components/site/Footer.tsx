import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Görev 8: ANPC/SOL linki (AB e-ticaret/mesafeli satış zorunluluğu) + yasal
// sayfa linkleri. Server Component - SiteHeader.tsx'teki gibi RSC içinde
// useTranslations() provider olmadan çalışıyor.
export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[#0B4F8A]/15 px-4 py-6 text-xs text-[#0A2540]/70 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} DEEF SRL — Apa Expres. {t("rights")}</p>
        <nav className="flex flex-wrap gap-3">
          <Link href="/terms" className="hover:text-[#0B4F8A]">
            {t("terms")}
          </Link>
          <Link href="/privacy" className="hover:text-[#0B4F8A]">
            {t("privacy")}
          </Link>
          <Link href="/cookies" className="hover:text-[#0B4F8A]">
            {t("cookies")}
          </Link>
          <a
            href="https://anpc.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0B4F8A]"
          >
            {t("anpc")}
          </a>
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0B4F8A]"
          >
            {t("sol")}
          </a>
        </nav>
      </div>
    </footer>
  );
}
