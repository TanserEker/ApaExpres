import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { LEGAL_CONTENT } from "@/lib/legal/content";
import LegalPage from "@/components/site/LegalPage";

export default function CookiesPage() {
  const locale = useLocale() as AppLocale;
  return <LegalPage doc={LEGAL_CONTENT.cookies[locale]} />;
}
