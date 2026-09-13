"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "apa-expres-cookie-notice-dismissed";

// Görev 8: çerez bildirimi. Sadece "kesinlikle gerekli" çerez kullanıldığı için
// (bkz. src/lib/legal/content.ts) opt-in/opt-out seçenekli bir rıza yöneticisi
// gerekmiyor — GDPR'a göre kesinlikle gerekli çerezler için onay şart değil,
// bu sadece bilgilendirme amaçlı, kapatılabilir bir bildirim.
export default function CookieNotice() {
  const t = useTranslations("cookieBanner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Sunucuda/ilk client render'da "false" (SSR/hydration uyumu için, bkz.
    // CartContext.tsx'teki aynı desen) - localStorage kontrolü mount sonrası.
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col items-center justify-between gap-2 bg-[#0A2540] px-4 py-3 text-sm text-white sm:flex-row sm:px-8">
      <p>
        {t("message")}{" "}
        <Link href="/cookies" className="underline">
          {t("learnMore")}
        </Link>
      </p>
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem(STORAGE_KEY, "1");
          setVisible(false);
        }}
        className="rounded bg-[#3EC1E0] px-3 py-1.5 font-medium text-[#0A2540]"
      >
        {t("accept")}
      </button>
    </div>
  );
}
