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

const LIMITE_PUBLICO_POR_HORA = 30;
const INTERVALO_PUBLICO_MS = 2_000;

async function conversaPublica(chatId: string, username?: string) {
  const agora = new Date();
  return prisma.$transaction(async (tx) => {
    const atual = await tx.telegramConversaPublica.findUnique({ where: { chatId } });
    if (!atual) {
      const conversa = await tx.telegramConversaPublica.create({
        data: { chatId, username, ultimaMensagemEm: agora, janelaInicio: agora, mensagensNaJanela: 1 },
      });
      return { conversa, bloqueio: null as "intervalo" | "limite" | null };
    }

    if (atual.ultimaMensagemEm && agora.getTime() - atual.ultimaMensagemEm.getTime() < INTERVALO_PUBLICO_MS) {
      return { conversa: atual, bloqueio: "intervalo" as const };
    }
    const novaJanela = agora.getTime() - atual.janelaInicio.getTime() >= 60 * 60 * 1_000;
    if (!novaJanela && atual.mensagensNaJanela >= LIMITE_PUBLICO_POR_HORA) {
      return { conversa: atual, bloqueio: "limite" as const };
    }

    const conversa = await tx.telegramConversaPublica.update({
      where: { chatId },
      data: {
        username: username ?? atual.username,
        ultimaMensagemEm: agora,
        janelaInicio: novaJanela ? agora : atual.janelaInicio,
        mensagensNaJanela: novaJanela ? 1 : { increment: 1 },
      },
    });
    return { conversa, bloqueio: null as "intervalo" | "limite" | null };
  });
}

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

    const contextoPublico = await prisma.telegramConversaPublica.findUnique({ where: { chatId: chatIdTexto } });
    await prisma.telegramVinculo.update({
      where: { id: vinculo.id },
      data: {
        chatId: chatIdTexto,
        username: update?.message?.from?.username ?? null,
        vinculadoEm: new Date(),
        codigo: null,
        codigoExpiraEm: null,
        contextoBusca: contextoPublico?.contextoBusca
          ? contextoPublico.contextoBusca as Prisma.InputJsonValue
          : Prisma.DbNull,
      },
    });
    await prisma.telegramConversaPublica.deleteMany({ where: { chatId: chatIdTexto } });
    await enviarTelegram(chatIdTexto, `Telegram conectado à sua conta MARIADAMAVI.\n\n${ajudaTelegram()}`);
    return NextResponse.json({ ok: true });
  }

  const vinculo = await prisma.telegramVinculo.findUnique({ where: { chatId: chatIdTexto } });

  if (/^\/(start|ajuda)(?:@\w+)?$/i.test(texto)) {
    await enviarTelegram(chatIdTexto, ajudaTelegram());
    return NextResponse.json({ ok: true });
  }
  if (/^\/limpar(?:@\w+)?$/i.test(texto)) {
    if (vinculo) {
      await prisma.telegramVinculo.update({ where: { id: vinculo.id }, data: { contextoBusca: Prisma.DbNull } });
    } else {
      await prisma.telegramConversaPublica.upsert({
        where: { chatId: chatIdTexto },
        create: { chatId: chatIdTexto, username: update?.message?.from?.username, contextoBusca: Prisma.DbNull },
        update: { contextoBusca: Prisma.DbNull, contextoAtualizadoEm: null },
      });
    }
    await enviarTelegram(chatIdTexto, "Conversa limpa. Qual produto você quer procurar?");
    return NextResponse.json({ ok: true });
  }
  if (/^\/alertas(?:@\w+)?$/i.test(texto)) {
    const appUrl = (process.env.APP_URL || "https://mariadamavi.com.br").replace(/\/$/, "");
    await enviarTelegram(chatIdTexto, `Configure seus alertas aqui:\n${appUrl}/buscador/configuracoes`);
    return NextResponse.json({ ok: true });
  }

  try {
    let contextoOrigem: { contextoBusca: Prisma.JsonValue | null; atualizadoEm: Date } = vinculo
      ? { contextoBusca: vinculo.contextoBusca, atualizadoEm: vinculo.atualizadoEm }
      : { contextoBusca: null, atualizadoEm: new Date(0) };
    let conversaAnonima: Awaited<ReturnType<typeof conversaPublica>>["conversa"] | null = null;
    if (!vinculo) {
      const publico = await conversaPublica(chatIdTexto, update?.message?.from?.username);
      if (publico.bloqueio === "intervalo") {
        await enviarTelegram(chatIdTexto, "Espere alguns segundos antes de enviar outra mensagem.");
        return NextResponse.json({ ok: true });
      }
      if (publico.bloqueio === "limite") {
        await enviarTelegram(chatIdTexto, "Você atingiu o limite de consultas desta hora. Tente novamente mais tarde.");
        return NextResponse.json({ ok: true });
      }
      conversaAnonima = publico.conversa;
      contextoOrigem = {
        contextoBusca: publico.conversa.contextoBusca,
        atualizadoEm: publico.conversa.contextoAtualizadoEm ?? new Date(0),
      };
    }

    const resultado = await processarConversaTelegram(contextoOrigem, texto);
    if (vinculo) {
      await prisma.telegramVinculo.update({
        where: { id: vinculo.id },
        data: { contextoBusca: resultado.contexto ? resultado.contexto as Prisma.InputJsonValue : Prisma.DbNull },
      });
    } else if (conversaAnonima) {
      await prisma.telegramConversaPublica.update({
        where: { chatId: conversaAnonima.chatId },
        data: {
          contextoBusca: resultado.contexto ? resultado.contexto as Prisma.InputJsonValue : Prisma.DbNull,
          contextoAtualizadoEm: resultado.contexto ? new Date() : null,
        },
      });
    }
    await enviarTelegram(chatIdTexto, resultado.texto);
  } catch (error) {
    console.error("[telegram/ia]", error instanceof Error ? error.message : "Erro desconhecido");
    await enviarTelegram(chatIdTexto, "Não consegui interpretar essa mensagem agora. Tente novamente em instantes ou use /ajuda.");
  }
  return NextResponse.json({ ok: true });
}
