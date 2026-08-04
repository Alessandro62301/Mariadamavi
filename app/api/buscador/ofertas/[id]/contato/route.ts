import { NextRequest, NextResponse } from "next/server";
import { buscarContato } from "@/lib/upstream";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  try {
    const contato = await buscarContato(idNum);
    if (!contato) {
      return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
    }
    return NextResponse.json(contato);
  } catch {
    return NextResponse.json({ error: "Falha ao buscar contato." }, { status: 502 });
  }
}
