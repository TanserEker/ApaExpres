"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { registerCustomer, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

export default function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as AppLocale;
  const [state, formAction, pending] = useActionState(
    registerCustomer.bind(null, locale),
    initialState
  );

  if (state.checkEmail) {
    return (
      <p className="rounded border border-[#3EC1E0] bg-[#3EC1E0]/10 p-4 text-[#0A2540]">
        {t("checkEmail")}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        {t("name")}
        <input
          name="name"
          required
          minLength={2}
          className="rounded border border-[#0B4F8A]/30 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {t("phone")}
        <input
          name="phone"
          required
          minLength={8}
          className="rounded border border-[#0B4F8A]/30 px-3 py-2"
        />
      </label>
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
          minLength={8}
          className="rounded border border-[#0B4F8A]/30 px-3 py-2"
        />
      </label>
      {state.error && (
        <p className="text-sm text-red-600">{t("genericError")}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#0B4F8A] px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {t("registerButton")}
      </button>
    </form>
  );
}
