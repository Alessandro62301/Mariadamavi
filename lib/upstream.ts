import axios from "axios";
import type { OfertasQuery, OfertasResponse, Contato, Status, Oferta } from "./types";
import { MOCK_OFERTAS, mockContatoPorId } from "./mock-ofertas";
import { prisma } from "./prisma";

/**
 * Cliente da API upstream (Conecta Lojista/BuskaPhone), que roda em cima do
 * Supabase. Sem SUPABASE_URL/SUPABASE_ANON_KEY configurados, todas as
 * funções abaixo caem pros dados de exemplo em mock-ofertas.ts.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const USANDO_UPSTREAM_REAL = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = axios.create({
  baseURL: SUPABASE_URL,
  headers: { apikey: SUPABASE_ANON_KEY || "" },
  timeout: 10_000,
});

// ---- Sessão do Supabase Auth (access_token expira em ~1h, renova via refresh_token) ----
// Cache em memória pra não bater no banco a cada request; a fonte de
// verdade fica na tabela ApiSession, que sobrevive a restarts do processo.
const PROVIDER = "supabase";
const margemSeguranca = 60_000; // renova 1 min antes de expirar

let cachedAccessToken: string | null = null;
let cachedExpiresAt = 0; // epoch ms

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedExpiresAt - margemSeguranca) {
    return cachedAccessToken;
  }

  const sessao = await prisma.apiSession.findUnique({ where: { provider: PROVIDER } });

  if (sessao?.accessToken && sessao.expiresAt && Date.now() < sessao.expiresAt.getTime() - margemSeguranca) {
    cachedAccessToken = sessao.accessToken;
    cachedExpiresAt = sessao.expiresAt.getTime();
    return cachedAccessToken;
  }

  const refreshToken = sessao?.refreshToken || process.env.SUPABASE_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error("Nenhum refresh_token disponível (banco vazio e SUPABASE_REFRESH_TOKEN não configurado).");
  }

  const { data } = await supabase.post(
    "/auth/v1/token?grant_type=refresh_token",
    { refresh_token: refreshToken }
  );

  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  // Supabase gira o refresh_token a cada uso — persiste o novo, senão o
  // próximo restart tenta reusar um token já consumido e quebra.
  await prisma.apiSession.upsert({
    where: { provider: PROVIDER },
    update: { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt },
    create: { provider: PROVIDER, accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt },
  });

  cachedAccessToken = data.access_token;
  cachedExpiresAt = expiresAt.getTime();
  return cachedAccessToken as string;
}

async function authHeaders() {
  const token = await getAccessToken();
  return { Authorization: `Bearer ${token}` };
}

export async function buscarOfertas(query: OfertasQuery): Promise<OfertasResponse> {
  if (USANDO_UPSTREAM_REAL) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 25;
    const offset = (page - 1) * pageSize;

    const params: Record<string, string> = { select: "*", offset: String(offset), limit: String(pageSize) };
    if (query.categoria) params.categoria = `eq.${query.categoria}`;
    if (query.condicao) params.condicao = `eq.${query.condicao}`;
    if (query.cor) params.cor = `eq.${query.cor}`;
    if (query.cidade) params.cidade = `eq.${query.cidade}`;
    if (query.q) params.modelo = `ilike.*${query.q}*`;

    if (query.sort === "menor-preco") params.order = "valor_num.asc";
    else if (query.sort === "maior-preco") params.order = "valor_num.desc";
    else params.order = "id.desc";

    const headers = { ...(await authHeaders()), Prefer: "count=exact" };
    const { data, headers: resHeaders } = await supabase.get<Oferta[]>("/rest/v1/ofertas_publicas", {
      params,
      headers,
    });

    const contentRange = resHeaders["content-range"] as string | undefined; // ex.: "0-24/5032"
    const total = contentRange ? Number(contentRange.split("/")[1]) : data.length;

    return { items: data, total, page, pageSize };
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
    // A RPC ofertas_contatos não recebe parâmetros — retorna o(s) contato(s)
    // disponível(is) no momento. Filtramos pelo id localmente por segurança.
    const headers = await authHeaders();
    const { data } = await supabase.post<Contato[]>("/rest/v1/rpc/ofertas_contatos", {}, { headers });
    return data.find((c) => c.id === id) ?? data[0] ?? null;
  }
  return mockContatoPorId(id);
}

export async function buscarStatus(): Promise<Status> {
  if (USANDO_UPSTREAM_REAL) {
    const headers = await authHeaders();
    const { data } = await supabase.post<Status>("/rest/v1/rpc/ofertas_stats", {}, { headers });
    return data;
  }
  const cidades = new Set(MOCK_OFERTAS.map((o) => o.cidade));
  return { total: MOCK_OFERTAS.length, cidades: cidades.size, fornecedores: 83 };
}
