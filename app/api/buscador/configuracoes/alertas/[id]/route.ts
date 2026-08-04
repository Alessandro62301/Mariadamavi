import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/usuario-atual";

async function alertaDoUsuario(id: number, userId: number) {
  return prisma.alertaPreco.findFirst({ where: { id, userId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await usuarioAtual(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || !(await alertaDoUsuario(id, user.id))) {
    return NextResponse.json({ error: "Alerta não encontrado." }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const data: { ativo?: boolean } = {};
  if (typeof body?.ativo === "boolean") data.ativo = body.ativo;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "Alteração inválida." }, { status: 400 });

  const alerta = await prisma.alertaPreco.update({ where: { id }, data });
  return NextResponse.json({ ...alerta, precoAlvo: Number(alerta.precoAlvo.toString()) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await usuarioAtual(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || !(await alertaDoUsuario(id, user.id))) {
    return NextResponse.json({ error: "Alerta não encontrado." }, { status: 404 });
  }
  await prisma.alertaPreco.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
