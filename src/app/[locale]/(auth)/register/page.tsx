import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const t = useTranslations("auth");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-[#0B4F8A]">
        {t("registerTitle")}
      </h1>
      <RegisterForm />
      <p className="text-sm text-[#0A2540]/70">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-[#0B4F8A] underline">
          {t("loginButton")}
        </Link>
      </p>
    </div>
  );
}
