import { NextResponse } from "next/server";
import { cacheOfertasFresco, listarOfertasDoCache } from "@/lib/cache-ofertas";
import { atualizarCacheOfertas } from "@/lib/upstream";

export async function GET() {
  try {
    let items = await listarOfertasDoCache();
    // Só "tabela vazia" não bastava: a origem recria as ofertas com ids novos
    // a cada coleta, então um cache velho serve ids que não existem mais e o
    // contato do fornecedor deixa de casar. Aqui o TTL também vale.
    if (items.length === 0 || !(await cacheOfertasFresco())) {
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
