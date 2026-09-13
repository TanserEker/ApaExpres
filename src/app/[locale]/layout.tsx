import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site/SiteHeader";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apa Expres",
  description: "Cosmopolis'te 1 saat icinde kapinizda 5L su teslimati.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// [locale] burada Next.js'in "multiple root layouts" desenindeki root layout'u
// (bkz. node_modules/next/dist/docs .../02-project-structure.md#creating-multiple-root-layouts) —
// html/body burada, app/admin/layout.tsx ise kendi ayrı root layout'una sahip
// (locale segmentinin tamamen dışında, bkz. GOREVLER.md Görev 5).
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#0A2540]">
        <NextIntlClientProvider locale={locale}>
          <SiteHeader isLoggedIn={Boolean(user)} />
          <main className="flex flex-1 flex-col">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
