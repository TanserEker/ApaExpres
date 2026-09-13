import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

// Link/redirect/usePathname/useRouter/getPathname — dil önekini (locale prefix) otomatik
// ekleyen next-intl sarmalayıcıları. Sayfa ve action'larda ham next/navigation yerine
// bunlar kullanılmalı, aksi halde `/checkout` gibi bir yönlendirme dil önekini kaybeder.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
