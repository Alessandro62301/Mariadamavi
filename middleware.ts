import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/buscador/login";
  const isAuthApi = pathname.startsWith("/api/auth/");

  if (isLoginPage || isAuthApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valido = await verifySessionToken(token);

  if (!valido) {
    if (pathname.startsWith("/api/buscador")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const loginUrl = new URL("/buscador/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buscador/:path*", "/api/buscador/:path*", "/fornecedores/:path*"],
};
