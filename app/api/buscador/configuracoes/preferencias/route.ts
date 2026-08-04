import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/usuario-atual";

const VISUALIZACOES = new Set(["lista", "grade"]);
const QUANTIDADES = new Set([10, 25, 50, 100]);

export async function PUT(req: NextRequest) {
  const user = await usuarioAtual(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const visualizacaoPadrao = String(body?.visualizacaoPadrao ?? "");
  const itensPorPagina = Number(body?.itensPorPagina);
  const categoriaPadrao = String(body?.categoriaPadrao ?? "").trim().toLocaleLowerCase("pt-BR");

  if (!VISUALIZACOES.has(visualizacaoPadrao) || !QUANTIDADES.has(itensPorPagina) || !categoriaPadrao) {
    return NextResponse.json({ error: "Preferências inválidas." }, { status: 400 });
  }

  const preferencias = await prisma.preferenciaBusca.upsert({
    where: { userId: user.id },
    create: { userId: user.id, visualizacaoPadrao, itensPorPagina, categoriaPadrao },
    update: { visualizacaoPadrao, itensPorPagina, categoriaPadrao },
  });
  return NextResponse.json(preferencias);
}
