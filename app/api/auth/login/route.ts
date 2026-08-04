import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { usuario, senha } = await req.json().catch(() => ({ usuario: "", senha: "" }));

  const usuarioEsperado = process.env.BUSCADOR_USER;
  const senhaEsperada = process.env.BUSCADOR_PASS;

  if (!usuarioEsperado || !senhaEsperada) {
    return NextResponse.json(
      { error: "BUSCADOR_USER/BUSCADOR_PASS não configurados no servidor." },
      { status: 500 }
    );
  }

  if (usuario !== usuarioEsperado || senha !== senhaEsperada) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const token = await createSessionToken(usuario);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}
