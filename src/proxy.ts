import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { getUserForRequest } from "@/lib/supabase/middleware";

// Next.js 16'da `middleware.ts` -> `proxy.ts` olarak yeniden adlandırıldı (bkz.
// node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md). `middleware`
// dosya adı/export'u hâlâ çalışıyor (deprecated) ama yeni kod için `proxy` önerilir.
const handleI18nRouting = createMiddleware(routing);

const LOCALE_PATTERN = new RegExp(`^/(${routing.locales.join("|")})(/.*)?$`);

function withoutLocale(pathname: string) {
  const match = pathname.match(LOCALE_PATTERN);
  return match ? match[2] ?? "/" : pathname;
}

function localePrefixOf(pathname: string) {
  const match = pathname.match(LOCALE_PATTERN);
  return match ? `/${match[1]}` : `/${routing.defaultLocale}`;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/** locale segmentinin dışında yaşıyor (bkz. GOREVLER.md Görev 5) — next-intl
  // yönlendirmesine hiç sokulmadan ayrı ele alınıyor.
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next({ request });
    if (pathname === "/admin/login") {
      return response;
    }

    const { supabase, user } = await getUserForRequest(request, response);
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!admin) {
      // Giriş yapmış ama admin degil - yanlışlıkla admin alanında dolaşmasın.
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return response;
  }

  const response = handleI18nRouting(request);
  const { user } = await getUserForRequest(request, response);

  const path = withoutLocale(request.nextUrl.pathname);
  const prefix = localePrefixOf(request.nextUrl.pathname);

  // Kurye alanı: giriş sayfası hariç her şey sürücü girişi ister (bkz. Görev 6, burada
  // sadece temel kapı kuruluyor - detaylı arayüz Görev 6'da).
  if (path.startsWith("/kurye") && path !== "/kurye/giris" && !user) {
    return NextResponse.redirect(new URL(`${prefix}/kurye/giris`, request.url));
  }

  // Sipariş vermek/geçmişi görmek için müşteri girişi gerekiyor - create_order RPC'si
  // zaten auth.uid() olmadan çalışmıyor, burası sadece kullanıcıyı erken uyarıyor.
  if ((path === "/checkout" || path.startsWith("/orders")) && !user) {
    const loginUrl = new URL(`${prefix}/login`, request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Next.js'in kendi önerdiği negative-match deseni (bkz. proxy.md#matcher):
  // api, _next/static, _next/image ve uzantılı statik dosyalar hariç her şey.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)"],
};
