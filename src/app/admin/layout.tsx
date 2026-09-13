import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Apa Expres — Admin",
  description: "Apa Expres ic yonetim paneli.",
};

// /admin, [locale] segmentinin tamamen dışında yaşıyor (bkz. GOREVLER.md Görev 5),
// bu yüzden kendi ayrı root layout'una sahip — Next.js'in "multiple root layouts"
// deseni (bkz. node_modules/next/dist/docs/.../02-project-structure.md). i18n yok:
// admin paneli tek dilli (Türkçe/Romence karışık, iç kullanım) kalacak.
export default function AdminRootLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A2540] text-white">
        {children}
      </body>
    </html>
  );
}
