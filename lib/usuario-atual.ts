import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { lerSessionToken, SESSION_COOKIE } from "./session";

/** Lê o cookie de sessão da request e devolve o usuário logado (ou null). */
export async function usuarioAtual(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const email = await lerSessionToken(token);
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}
