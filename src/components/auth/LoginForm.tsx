"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { loginCustomer, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

export default function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale() as AppLocale;
  const [state, formAction, pending] = useActionState(
    loginCustomer.bind(null, locale),
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="flex flex-col gap-1 text-sm">
        {t("email")}
        <input
          type="email"
          name="email"
          required
          className="rounded border border-[#0B4F8A]/30 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t("password")}
        <input
          type="password"
          name="password"
          required
          className="rounded border border-[#0B4F8A]/30 px-3 py-2"
        />
      </label>
      {state.error && (
        <p className="text-sm text-red-600">{t("invalidCredentials")}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#0B4F8A] px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {t("loginButton")}
      </button>
    </form>
  );
}
