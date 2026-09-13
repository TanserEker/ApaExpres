import type { MetadataRoute } from "next";

// PWA manifest — Görev 7. app/ kökünde (root) tanımlanması gerekiyor (bkz.
// node_modules/next/dist/docs/.../manifest.md), [locale]/admin ayrımından
// bağımsız, tek bir manifest tüm siteye uygulanıyor. Marka rengi #0B4F8A,
// ikonlar yer tutucu (bkz. README "logo yok, yazı markası yer tutucu").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apa Expres — Cosmopolis su teslimatı",
    short_name: "Apa Expres",
    description: "Cosmopolis'te 1 saat içinde kapınızda 5L su teslimatı.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0B4F8A",
    lang: "ro",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
