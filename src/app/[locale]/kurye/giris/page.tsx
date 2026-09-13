import { useTranslations } from "next-intl";
import DriverLoginForm from "@/components/auth/DriverLoginForm";

// Sürücü girişi — self-servis kayıt yok (bkz. src/app/actions/driver-auth.ts).
// Asıl kurye paneli Görev 6'da bu klasörün altına eklenecek.
export default function DriverLoginPage() {
  const t = useTranslations("courier");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-[#0B4F8A]">
        {t("loginTitle")}
      </h1>
      <DriverLoginForm />
    </div>
  );
}
