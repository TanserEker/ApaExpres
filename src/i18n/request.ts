import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

// `requestLocale` next-intl'de `next/root-params` lehine deprecated ama hâlâ çalışıyor;
// kök parametre tiplerinin `next typegen`/build ile üretilmesine bağımlı olmamak için
// (bkz. Next.js 16 i18n rehberi) bilinçli olarak bu daha taşınabilir yol seçildi.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
