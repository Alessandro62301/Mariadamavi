import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarTelegram } from "@/lib/notificacoes";
import { ajudaTelegram, processarConversaTelegram } from "@/lib/telegram-ia";
import { Prisma } from "@prisma/client";

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
  if (chatId === undefined || !texto) return NextResponse.json({ ok: true });

  const chatIdTexto = String(chatId);
  const codigo = texto.match(/^\/start\s+([a-zA-Z0-9]+)$/)?.[1];

  if (codigo) {
    const vinculo = await prisma.telegramVinculo.findFirst({
      where: { codigo, codigoExpiraEm: { gt: new Date() } },
    });
    if (!vinculo) {
      await enviarTelegram(chatIdTexto, "Este link de vinculação expirou. Gere outro na tela de configurações.");
      return NextResponse.json({ ok: true });
    }

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
        contextoBusca: Prisma.DbNull,
      },
    });
    await enviarTelegram(chatIdTexto, `Telegram conectado à sua conta MARIADAMAVI.\n\n${ajudaTelegram()}`);
    return NextResponse.json({ ok: true });
  }

  const vinculo = await prisma.telegramVinculo.findUnique({ where: { chatId: chatIdTexto } });
  if (!vinculo) {
    await enviarTelegram(chatIdTexto, "Vincule o Telegram primeiro pela tela de configurações do MARIADAMAVI.");
    return NextResponse.json({ ok: true });
  }

  if (/^\/(start|ajuda)(?:@\w+)?$/i.test(texto)) {
    await enviarTelegram(chatIdTexto, ajudaTelegram());
    return NextResponse.json({ ok: true });
  }
  if (/^\/limpar(?:@\w+)?$/i.test(texto)) {
    await prisma.telegramVinculo.update({ where: { id: vinculo.id }, data: { contextoBusca: Prisma.DbNull } });
    await enviarTelegram(chatIdTexto, "Conversa limpa. Qual produto você quer procurar?");
    return NextResponse.json({ ok: true });
  }
  if (/^\/alertas(?:@\w+)?$/i.test(texto)) {
    const appUrl = (process.env.APP_URL || "https://mariadamavi.com.br").replace(/\/$/, "");
    await enviarTelegram(chatIdTexto, `Configure seus alertas aqui:\n${appUrl}/buscador/configuracoes`);
    return NextResponse.json({ ok: true });
  }

  try {
    const resultado = await processarConversaTelegram(vinculo, texto);
    await prisma.telegramVinculo.update({
      where: { id: vinculo.id },
      data: { contextoBusca: resultado.contexto ? resultado.contexto as Prisma.InputJsonValue : Prisma.DbNull },
    });
    await enviarTelegram(chatIdTexto, resultado.texto);
  } catch (error) {
    console.error("[telegram/ia]", error instanceof Error ? error.message : "Erro desconhecido");
    await enviarTelegram(chatIdTexto, "Não consegui interpretar essa mensagem agora. Tente novamente em instantes ou use /ajuda.");
  }
  return NextResponse.json({ ok: true });
}
