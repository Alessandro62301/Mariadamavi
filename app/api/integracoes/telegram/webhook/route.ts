import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarTelegram } from "@/lib/notificacoes";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: { id?: number | string };
    from?: { username?: string };
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Webhook não autorizado." }, { status: 401 });
  }
  const update = await req.json().catch(() => null) as TelegramUpdate | null;
  const texto = update?.message?.text?.trim() ?? "";
  const chatId = update?.message?.chat?.id;
  const codigo = texto.match(/^\/start\s+([a-zA-Z0-9]+)$/)?.[1];
  if (!codigo || chatId === undefined) return NextResponse.json({ ok: true });

  const vinculo = await prisma.telegramVinculo.findFirst({
    where: { codigo, codigoExpiraEm: { gt: new Date() } },
  });
  if (!vinculo) {
    await enviarTelegram(String(chatId), "Este link de vinculação expirou. Gere outro na tela de configurações.");
    return NextResponse.json({ ok: true });
  }

  const chatIdTexto = String(chatId);
  const outroVinculo = await prisma.telegramVinculo.findFirst({
    where: { chatId: chatIdTexto, id: { not: vinculo.id } },
  });
  if (outroVinculo) {
    await enviarTelegram(chatIdTexto, "Esta conta do Telegram já está vinculada a outro usuário.");
    return NextResponse.json({ ok: true });
  }

  await prisma.telegramVinculo.update({
    where: { id: vinculo.id },
    data: {
      chatId: chatIdTexto,
      username: update?.message?.from?.username ?? null,
      vinculadoEm: new Date(),
      codigo: null,
      codigoExpiraEm: null,
    },
  });
  await enviarTelegram(chatIdTexto, "Telegram conectado à sua conta MARIADAMAVI. Os alertas ativos poderão chegar por aqui.");
  return NextResponse.json({ ok: true });
}
