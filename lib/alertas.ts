import { prisma } from "./prisma";
import type { Oferta } from "./types";
import { enviarEmailAlerta, enviarTelegram, mensagemTelegramAlerta } from "./notificacoes";

type Canal = "email" | "telegram";

function ofertaCacheParaOferta(oferta: Awaited<ReturnType<typeof prisma.ofertaCache.findFirst>>): Oferta | null {
  if (!oferta) return null;
  return {
    id: oferta.id,
    modelo: oferta.modelo,
    categoria: oferta.categoria,
    condicao: oferta.condicao,
    cor: oferta.cor,
    variante: oferta.variante,
    cidade: oferta.cidade,
    valor: oferta.valor,
    valor_num: Number(oferta.valorNum.toString()),
    foto_url: oferta.fotoUrl,
    data_atualizacao: oferta.dataAtualizacao,
    created_at: oferta.createdAtOrigem?.toISOString() ?? "",
    verificado: oferta.verificado,
  };
}

async function jaEnviado(alertaId: number, ofertaId: number, canal: Canal) {
  const registro = await prisma.alertaDisparo.findUnique({
    where: { alertaId_ofertaId_canal: { alertaId, ofertaId, canal } },
  });
  return registro?.status === "SUCESSO";
}

async function registrarResultado(alertaId: number, ofertaId: number, canal: Canal, resultado: { ok: boolean; erro?: string }) {
  const agora = new Date();
  await prisma.alertaDisparo.upsert({
    where: { alertaId_ofertaId_canal: { alertaId, ofertaId, canal } },
    create: {
      alertaId,
      ofertaId,
      canal,
      status: resultado.ok ? "SUCESSO" : "ERRO",
      erro: resultado.ok ? null : resultado.erro?.slice(0, 1_000),
      enviadoEm: resultado.ok ? agora : null,
    },
    update: {
      status: resultado.ok ? "SUCESSO" : "ERRO",
      erro: resultado.ok ? null : resultado.erro?.slice(0, 1_000),
      enviadoEm: resultado.ok ? agora : null,
    },
  });
}

export async function processarAlertas() {
  const alertas = await prisma.alertaPreco.findMany({
    where: { ativo: true },
    include: { user: true },
  });
  let enviados = 0;
  let erros = 0;

  for (const alerta of alertas) {
    const ofertas = await prisma.ofertaCache.findMany({
      where: {
        valorNum: { lte: alerta.precoAlvo },
        ...(alerta.categoria ? { categoria: alerta.categoria } : {}),
        ...(alerta.modeloBusca ? { modelo: { contains: alerta.modeloBusca } } : {}),
        ...(alerta.condicaoDesejada ? { condicao: alerta.condicaoDesejada } : {}),
      },
      orderBy: [{ valorNum: "asc" }, { id: "desc" }],
      take: 20,
    });

    for (const registro of ofertas) {
      const oferta = ofertaCacheParaOferta(registro);
      if (!oferta) continue;
      const pendencias: Canal[] = [];
      if (alerta.canalEmail && !(await jaEnviado(alerta.id, oferta.id, "email"))) pendencias.push("email");
      if (alerta.canalTelegram && !(await jaEnviado(alerta.id, oferta.id, "telegram"))) pendencias.push("telegram");
      if (pendencias.length === 0) continue;

      let houveSucesso = false;
      for (const canal of pendencias) {
        const resultado = canal === "email"
          ? await enviarEmailAlerta(alerta.user.email, oferta)
          : alerta.userId
            ? await prisma.telegramVinculo.findUnique({ where: { userId: alerta.userId } }).then((vinculo) =>
              vinculo?.chatId
                ? enviarTelegram(vinculo.chatId, mensagemTelegramAlerta(oferta))
                : { ok: false as const, erro: "Telegram não vinculado." })
            : { ok: false as const, erro: "Usuário inválido." };
        await registrarResultado(alerta.id, oferta.id, canal, resultado);
        if (resultado.ok) {
          enviados += 1;
          houveSucesso = true;
        } else erros += 1;
      }

      if (houveSucesso) await prisma.alertaPreco.update({ where: { id: alerta.id }, data: { ultimoDisparoEm: new Date() } });
      break;
    }
  }

  return { alertas: alertas.length, enviados, erros };
}
