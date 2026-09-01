import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_SESSION_COOKIE } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** يحمي مسارات لوحة التحكم ويحدّث جلسة Supabase على كل طلب. */
export async function middleware(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboard) return response;

  const signedIn = isSupabaseConfigured
    ? Boolean(userId)
    : Boolean(request.cookies.get(DEMO_SESSION_COOKIE)?.value);

  if (!signedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
