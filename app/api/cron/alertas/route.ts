import { NextRequest, NextResponse } from "next/server";
import { atualizarCacheOfertas } from "@/lib/upstream";
import { processarAlertas } from "@/lib/alertas";
import { configurarWebhookTelegram } from "@/lib/notificacoes";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Job não autorizado." }, { status: 401 });
  }

  try {
    const cache = await atualizarCacheOfertas();
    const telegram = await configurarWebhookTelegram();
    const alertas = await processarAlertas();
    return NextResponse.json({ ok: true, cache, telegram, alertas });
  } catch (error) {
    console.error("[cron/alertas]", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json({ error: "Falha ao atualizar cache e processar alertas." }, { status: 500 });
  }
}
