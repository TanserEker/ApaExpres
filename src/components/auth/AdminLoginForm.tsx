"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminAuthState } from "@/app/actions/admin-auth";

const initialState: AdminAuthState = {};

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAdmin,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        E-posta
        <input
          type="email"
          name="email"
          required
          className="rounded border border-white/20 bg-white/5 px-3 py-2 text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Şifre
        <input
          type="password"
          name="password"
          required
          className="rounded border border-white/20 bg-white/5 px-3 py-2 text-white"
        />
      </label>
      {state.error && (
        <p className="text-sm text-red-400">E-posta veya şifre hatalı.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#3EC1E0] px-4 py-2 font-medium text-[#0A2540] disabled:opacity-60"
      >
        Giriş yap
      </button>
    </form>
  );
}
