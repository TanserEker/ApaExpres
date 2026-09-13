import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

// proxy.ts içinde next-intl'in ürettiği response (locale rewrite/redirect) korunmalı,
// bu yüzden burada yeni bir NextResponse.next() OLUŞTURMUYORUZ — next-intl'in response'unu
// parametre olarak alıp Supabase çerezlerini onun üzerine yazıyoruz (aycabayramoglu'daki
// src/lib/supabase/middleware.ts deseninden farkı bu — orada i18n olmadığı için kendi
// response'unu oluşturabiliyordu).
export async function getUserForRequest(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}
