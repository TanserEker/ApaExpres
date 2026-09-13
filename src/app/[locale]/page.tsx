import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#3EC1E0]/10 to-white px-6 py-24 text-center">
      <h1 className="text-4xl font-bold text-[#0B4F8A] sm:text-5xl">
        {t("title")}
      </h1>
      <p className="max-w-xl text-xl font-medium text-[#0A2540]">
        {t("tagline")}
      </p>
      <p className="max-w-md text-[#0A2540]/70">{t("description")}</p>
      <Link
        href="/catalog"
        className="rounded-full bg-[#0B4F8A] px-6 py-3 font-medium text-white transition-colors hover:bg-[#0A2540]"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
