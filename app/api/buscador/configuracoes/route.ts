import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/usuario-atual";
import { emailConfigurado, telegramConfigurado } from "@/lib/notificacoes";
import { estadoCache } from "@/lib/cache-ofertas";

export async function GET(req: NextRequest) {
  const user = await usuarioAtual(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const [preferencias, alertas, telegram, cache] = await Promise.all([
    prisma.preferenciaBusca.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    }),
    prisma.alertaPreco.findMany({ where: { userId: user.id }, orderBy: { criadoEm: "desc" } }),
    prisma.telegramVinculo.findUnique({ where: { userId: user.id } }),
    estadoCache(),
  ]);

  return NextResponse.json({
    usuario: { nome: user.nome, email: user.email },
    preferencias,
    alertas: alertas.map((alerta) => ({ ...alerta, precoAlvo: Number(alerta.precoAlvo.toString()) })),
    telegram: {
      vinculado: Boolean(telegram?.chatId),
      username: telegram?.username ?? null,
      vinculadoEm: telegram?.vinculadoEm?.toISOString() ?? null,
    },
    canais: {
      email: emailConfigurado(),
      telegram: telegramConfigurado(),
      botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
    },
    cache,
  });
}
