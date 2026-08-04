import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/usuario-atual";
import { telegramConfigurado } from "@/lib/notificacoes";

export async function POST(req: NextRequest) {
  const user = await usuarioAtual(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!telegramConfigurado() || !botUsername) {
    return NextResponse.json({ error: "Telegram ainda não configurado no servidor." }, { status: 503 });
  }

  const codigo = crypto.randomUUID().replace(/-/g, "");
  const codigoExpiraEm = new Date(Date.now() + 15 * 60 * 1_000);
  await prisma.telegramVinculo.upsert({
    where: { userId: user.id },
    create: { userId: user.id, codigo, codigoExpiraEm },
    update: { codigo, codigoExpiraEm },
  });
  return NextResponse.json({ url: `https://t.me/${botUsername}?start=${codigo}`, expiraEm: codigoExpiraEm.toISOString() });
}

export async function DELETE(req: NextRequest) {
  const user = await usuarioAtual(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  await prisma.telegramVinculo.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
