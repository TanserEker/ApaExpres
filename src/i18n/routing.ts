import { defineRouting } from "next-intl/routing";

// RO varsayılan dil (bkz. GOREVLER.md "Kesin kararlar") — /ro /en /tr URL segmenti.
// localePrefix "always" bırakıldı: "/" her zaman "/ro"ya yönlenir, hiçbir rota
// çıplak (dil öneki olmadan) kalmaz — bu da proxy.ts'teki rol koruma mantığını
// (kurye/checkout guard'ları) basitleştiriyor.
export const routing = defineRouting({
  locales: ["ro", "en", "tr"],
  defaultLocale: "ro",
});

export type AppLocale = (typeof routing.locales)[number];
