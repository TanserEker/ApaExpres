import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { logoutCustomer } from "@/app/actions/auth";
import LocaleSwitcher from "@/components/site/LocaleSwitcher";

// Server Component — next-intl App Router'da useTranslations()/useLocale() provider
// olmadan da RSC içinde senkron çalışıyor (next-intl'in request-scoped AsyncLocalStorage
// deseni), bu yüzden "use client" gerekmiyor.
export default function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#0B4F8A]/15 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
      <Link href="/" className="text-lg font-semibold text-[#0B4F8A]">
        Apa Expres
      </Link>

      <nav className="flex items-center gap-4 text-sm text-[#0A2540]">
        <Link href="/catalog" className="hover:text-[#0B4F8A]">
          {t("catalog")}
        </Link>
        {isLoggedIn && (
          <Link href="/orders" className="hover:text-[#0B4F8A]">
            {t("orders")}
          </Link>
        )}
        {isLoggedIn ? (
          <form action={logoutCustomer.bind(null, locale)}>
            <button type="submit" className="hover:text-[#0B4F8A]">
              {t("logout")}
            </button>
          </form>
        ) : (
          <>
            <Link href="/login" className="hover:text-[#0B4F8A]">
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="rounded bg-[#0B4F8A] px-3 py-1.5 text-white hover:bg-[#0A2540]"
            >
              {t("register")}
            </Link>
          </>
        )}
        <LocaleSwitcher />
      </nav>
    </header>
  );
}
