import axios from "axios";
import type { OfertasQuery, OfertasResponse, Contato, Status } from "./types";
import { MOCK_OFERTAS, mockContatoPorId } from "./mock-ofertas";

/**
 * Cliente axios pra API upstream (Conecta Lojista/BuskaPhone).
 * Preencher BUSCADOR_API_BASE_URL e BUSCADOR_API_TOKEN no .env quando a
 * credencial estiver disponível — nenhum outro arquivo precisa mudar.
 */
export const upstream = axios.create({
  baseURL: process.env.BUSCADOR_API_BASE_URL || "",
  headers: process.env.BUSCADOR_API_TOKEN
    ? { Authorization: `Bearer ${process.env.BUSCADOR_API_TOKEN}` }
    : {},
  timeout: 10_000,
});

const USANDO_UPSTREAM_REAL = Boolean(process.env.BUSCADOR_API_BASE_URL);

export async function buscarOfertas(query: OfertasQuery): Promise<OfertasResponse> {
  if (USANDO_UPSTREAM_REAL) {
    // TODO: trocar pelo endpoint real, ex.: upstream.get('/ofertas', { params: query })
    const { data } = await upstream.get<OfertasResponse>("/ofertas", { params: query });
    return data;
  }

  let items = [...MOCK_OFERTAS];

  if (query.categoria) items = items.filter((o) => o.categoria === query.categoria);
  if (query.condicao) items = items.filter((o) => o.condicao === query.condicao);
  if (query.cor) items = items.filter((o) => o.cor === query.cor);
  if (query.cidade) items = items.filter((o) => o.cidade === query.cidade);
  if (query.q) {
    const termo = query.q.toLowerCase();
    items = items.filter((o) => o.modelo.toLowerCase().includes(termo));
  }

  if (query.sort === "menor-preco") items.sort((a, b) => a.valor_num - b.valor_num);
  else if (query.sort === "maior-preco") items.sort((a, b) => b.valor_num - a.valor_num);
  else items.sort((a, b) => b.id - a.id);

  const total = items.length;
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 25;
  const start = (page - 1) * pageSize;
  const paginado = items.slice(start, start + pageSize);

  return { items: paginado, total, page, pageSize };
}

export async function buscarContato(id: number): Promise<Contato | null> {
  if (USANDO_UPSTREAM_REAL) {
    // TODO: trocar pelo endpoint real, ex.: upstream.get(`/ofertas/${id}/contato`)
    const { data } = await upstream.get<Contato[]>(`/ofertas/${id}/contato`);
    return data[0] ?? null;
  }
  return mockContatoPorId(id);
}

export async function buscarStatus(): Promise<Status> {
  if (USANDO_UPSTREAM_REAL) {
    // TODO: trocar pelo endpoint real, ex.: upstream.get('/status')
    const { data } = await upstream.get<Status>("/status");
    return data;
  }
  const cidades = new Set(MOCK_OFERTAS.map((o) => o.cidade));
  return { total: MOCK_OFERTAS.length, cidades: cidades.size, fornecedores: 83 };
}
