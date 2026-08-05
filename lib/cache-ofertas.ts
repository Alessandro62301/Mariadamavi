import type { Oferta, OfertasQuery, OfertasResponse, Status } from "./types";
import { prisma } from "./prisma";

const CHAVE_CACHE = "ofertas";
const TTL_CACHE_MS = 60 * 60 * 1_000;
const TAMANHO_LOTE_GRAVACAO = 500;
const TAMANHOS_PAGINA = new Set([10, 25, 50, 100]);

function normalizarEspacos(valor: string) {
  return valor.replace(/\s+/g, " ").trim();
}

export function extrairArmazenamento(modelo: string, variante?: string | null): string | null {
  const texto = `${modelo} ${variante ?? ""}`;
  const combinada = texto.match(/\b\d+\s*\/\s*(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);
  const capacidade = combinada ?? texto.match(/\b(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);
  if (!capacidade) return null;
  return `${capacidade[1].replace(",", ".")}${capacidade[2].toUpperCase()}`;
}

export function extrairModeloBase(modelo: string) {
  return normalizarEspacos(
    modelo
      .replace(/\b\d+\s*\/\s*\d+(?:[.,]\d+)?\s*(GB|TB)\b/gi, " ")
      .replace(/\b\d+(?:[.,]\d+)?\s*(GB|TB)\b/gi, " ")
      .replace(/[\s\-\/|]+$/g, ""),
  );
}

export function extrairEstado(cidade: string) {
  return cidade.match(/,\s*([A-Z]{2})\s*$/i)?.[1].toUpperCase() ?? null;
}

function dataValida(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function paraOferta(item: {
  id: number;
  modelo: string;
  categoria: string;
  condicao: string;
  cor: string;
  variante: string | null;
  cidade: string;
  valor: string;
  valorNum: { toString(): string };
  fotoUrl: string;
  dataAtualizacao: string;
  createdAtOrigem: Date | null;
  verificado: boolean;
  fornecedor: string | null;
}): Oferta {
  return {
    id: item.id,
    modelo: item.modelo,
    categoria: item.categoria,
    condicao: item.condicao,
    cor: item.cor,
    variante: item.variante,
    cidade: item.cidade,
    valor: item.valor,
    valor_num: Number(item.valorNum.toString()),
    foto_url: item.fotoUrl,
    data_atualizacao: item.dataAtualizacao,
    created_at: item.createdAtOrigem?.toISOString() ?? "",
    verificado: item.verificado,
    fornecedor: item.fornecedor,
  };
}

export async function cacheOfertasFresco() {
  const controle = await prisma.cacheControle.findUnique({ where: { chave: CHAVE_CACHE } });
  return Boolean(controle && controle.total > 0 && Date.now() - controle.atualizadoEm.getTime() < TTL_CACHE_MS);
}

export async function salvarCacheOfertas(ofertas: Oferta[], status: Status, fornecedores = new Map<number, string>()) {
  const agora = new Date();
  const fornecedoresAnteriores = await prisma.ofertaCache.findMany({
    where: { fornecedor: { not: null } },
    select: { id: true, fornecedor: true },
  });
  const fornecedoresResolvidos = new Map<number, string>();
  for (const item of fornecedoresAnteriores) {
    if (item.fornecedor) fornecedoresResolvidos.set(item.id, item.fornecedor);
  }
  for (const [id, fornecedor] of fornecedores) fornecedoresResolvidos.set(id, fornecedor);

  const registros = ofertas.filter((oferta) => Number.isFinite(oferta.id) && Boolean(oferta.modelo)).map((oferta) => ({
    id: oferta.id,
    modelo: String(oferta.modelo),
    modeloBase: extrairModeloBase(oferta.modelo),
    categoria: String(oferta.categoria ?? ""),
    condicao: String(oferta.condicao ?? ""),
    cor: String(oferta.cor ?? ""),
    variante: oferta.variante ? String(oferta.variante) : null,
    armazenamento: extrairArmazenamento(oferta.modelo, oferta.variante),
    cidade: String(oferta.cidade ?? ""),
    estado: extrairEstado(oferta.cidade ?? ""),
    valor: String(oferta.valor ?? ""),
    valorNum: Number.isFinite(oferta.valor_num) ? oferta.valor_num : 0,
    fotoUrl: String(oferta.foto_url ?? ""),
    dataAtualizacao: String(oferta.data_atualizacao ?? ""),
    createdAtOrigem: dataValida(oferta.created_at),
    verificado: oferta.verificado,
    fornecedor: fornecedoresResolvidos.get(oferta.id) ?? null,
    atualizadoEm: agora,
  }));

  await prisma.$transaction(async (tx) => {
    await tx.ofertaCache.deleteMany();
    for (let inicio = 0; inicio < registros.length; inicio += TAMANHO_LOTE_GRAVACAO) {
      await tx.ofertaCache.createMany({ data: registros.slice(inicio, inicio + TAMANHO_LOTE_GRAVACAO) });
    }
    await tx.cacheControle.upsert({
      where: { chave: CHAVE_CACHE },
      create: { chave: CHAVE_CACHE, atualizadoEm: agora, ...status },
      update: { atualizadoEm: agora, ...status },
    });
  }, { timeout: 30_000 });
}

export async function buscarOfertasNoCache(query: OfertasQuery): Promise<OfertasResponse> {
  const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;
  const solicitado = query.itensPorPagina ?? query.pageSize ?? 25;
  const pageSize = TAMANHOS_PAGINA.has(solicitado) ? solicitado : 25;
  const where = {
    ...(query.categoria ? { categoria: query.categoria } : {}),
    ...(query.condicao ? { condicao: query.condicao } : {}),
    ...(query.cor ? { cor: query.cor } : {}),
    ...(query.estado ? { estado: query.estado } : {}),
    ...(query.cidade ? { cidade: query.cidade } : {}),
    ...(query.modelo ? { modeloBase: query.modelo } : {}),
    ...(query.armazenamento ? { armazenamento: query.armazenamento } : {}),
    ...(query.q ? { modelo: { contains: query.q } } : {}),
  };
  const orderBy = query.sort === "menor-preco"
    ? { valorNum: "asc" as const }
    : query.sort === "maior-preco"
      ? { valorNum: "desc" as const }
      : query.sort === "a-z"
        ? { modelo: "asc" as const }
        : { id: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.ofertaCache.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.ofertaCache.count({ where }),
  ]);
  return { items: items.map(paraOferta), total, page, pageSize };
}

export async function listarOfertasDoCache(): Promise<Oferta[]> {
  const ofertas = await prisma.ofertaCache.findMany();
  return ofertas.map(paraOferta);
}

export async function buscarStatusNoCache(): Promise<Status | null> {
  const controle = await prisma.cacheControle.findUnique({ where: { chave: CHAVE_CACHE } });
  if (!controle) return null;
  return { total: controle.total, cidades: controle.cidades, fornecedores: controle.fornecedores };
}

export async function estadoCache() {
  const controle = await prisma.cacheControle.findUnique({ where: { chave: CHAVE_CACHE } });
  return controle ? {
    atualizadoEm: controle.atualizadoEm.toISOString(),
    total: controle.total,
    fresco: Date.now() - controle.atualizadoEm.getTime() < TTL_CACHE_MS,
  } : null;
}
