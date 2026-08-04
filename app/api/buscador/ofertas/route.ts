import { NextResponse } from "next/server";
import { listarOfertasDoCache } from "@/lib/cache-ofertas";
import { atualizarCacheOfertas } from "@/lib/upstream";

export async function GET() {
  try {
    let items = await listarOfertasDoCache();
    if (items.length === 0) {
      await atualizarCacheOfertas();
      items = await listarOfertasDoCache();
    }

    const catalogo = items.map((oferta) => ({
      ...oferta,
      foto_url: `/api/buscador/ofertas/${oferta.id}/imagem`,
    }));
    return NextResponse.json({ items: catalogo, total: catalogo.length, page: 1, pageSize: catalogo.length });
  } catch (error) {
    console.error("[buscador/ofertas]", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json({ error: "Falha ao carregar o catálogo." }, { status: 502 });
  }
}
