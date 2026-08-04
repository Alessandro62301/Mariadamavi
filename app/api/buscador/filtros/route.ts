import { NextResponse } from "next/server";
import { buscarFiltrosDisponiveis } from "@/lib/upstream";

export async function GET() {
  try {
    const filtros = await buscarFiltrosDisponiveis();
    return NextResponse.json(filtros);
  } catch {
    return NextResponse.json({ error: "Falha ao carregar os filtros." }, { status: 502 });
  }
}
