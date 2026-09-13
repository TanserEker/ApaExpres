import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LoginForm from "@/components/auth/LoginForm";

// getTranslations (async) kullanılıyor - bkz. catalog/page.tsx'teki not (searchParams
// da dinamik bir API olduğu için aynı sorun burada da geçerli).
export default async function LoginPage({
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { next } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-[#0B4F8A]">
        {t("loginTitle")}
      </h1>
      <LoginForm next={typeof next === "string" ? next : undefined} />
      <p className="text-sm text-[#0A2540]/70">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-[#0B4F8A] underline">
          {t("registerButton")}
        </Link>
      </p>
    </div>
  );
}
