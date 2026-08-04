import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/usuario-atual";

export async function POST(req: NextRequest) {
  const user = await usuarioAtual(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const categoria = String(body?.categoria ?? "").trim().toLocaleLowerCase("pt-BR") || null;
  const modeloBusca = String(body?.modeloBusca ?? "").trim() || null;
  const condicaoDesejada = String(body?.condicaoDesejada ?? "").trim() || null;
  const precoAlvo = Number(body?.precoAlvo);
  const canalEmail = body?.canalEmail === true;
  const canalTelegram = body?.canalTelegram === true;

  if ((!categoria && !modeloBusca) || !Number.isFinite(precoAlvo) || precoAlvo <= 0 || (!canalEmail && !canalTelegram)) {
    return NextResponse.json({ error: "Informe categoria ou modelo, preço-alvo e ao menos um canal." }, { status: 400 });
  }

  const alerta = await prisma.alertaPreco.create({
    data: { userId: user.id, categoria, modeloBusca, condicaoDesejada, precoAlvo, canalEmail, canalTelegram },
  });
  return NextResponse.json({ ...alerta, precoAlvo: Number(alerta.precoAlvo.toString()) }, { status: 201 });
}
