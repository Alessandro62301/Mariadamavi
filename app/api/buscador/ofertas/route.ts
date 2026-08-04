import { NextRequest, NextResponse } from "next/server";
import { buscarOfertas } from "@/lib/upstream";
import type { OfertasQuery } from "@/lib/types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const query: OfertasQuery = {
    categoria: sp.get("categoria") || undefined,
    condicao: sp.get("condicao") || undefined,
    cor: sp.get("cor") || undefined,
    estado: sp.get("estado") || undefined,
    cidade: sp.get("cidade") || undefined,
    modelo: sp.get("modelo") || undefined,
    armazenamento: sp.get("armazenamento") || undefined,
    q: sp.get("q") || undefined,
    sort: (sp.get("sort") as OfertasQuery["sort"]) || "recentes",
    page: Number(sp.get("page")) || 1,
    itensPorPagina: Number(sp.get("itensPorPagina") || sp.get("pageSize")) || 25,
  };

  try {
    const resultado = await buscarOfertas(query);
    return NextResponse.json(resultado);
  } catch {
    return NextResponse.json({ error: "Falha ao buscar ofertas." }, { status: 502 });
  }
}
