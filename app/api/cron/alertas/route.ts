import { NextRequest, NextResponse } from "next/server";
import { atualizarCacheOfertas } from "@/lib/upstream";
import { processarAlertas } from "@/lib/alertas";
import { configurarWebhookTelegram } from "@/lib/notificacoes";

export const runtime = "nodejs";

async function executarEtapa<T>(nome: string, executar: () => Promise<T>) {
  try {
    return { ok: true as const, resultado: await executar() };
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
    console.error(`[cron/${nome}]`, mensagem);
    return { ok: false as const, erro: mensagem };
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Job não autorizado." }, { status: 401 });
  }

  // O webhook é independente do cache. Ele precisa ser registrado mesmo quando
  // a origem das ofertas estiver temporariamente indisponível.
  const telegram = await configurarWebhookTelegram();
  if (!telegram.ok) console.error("[cron/telegram]", telegram.erro);

  const cache = await executarEtapa("cache", atualizarCacheOfertas);
  const alertas = await executarEtapa("alertas", processarAlertas);
  return NextResponse.json({
    ok: telegram.ok && cache.ok && alertas.ok,
    telegram,
    cache,
    alertas,
  });
}
