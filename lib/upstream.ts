import axios from "axios";
import type {
  CidadeFiltro,
  Contato,
  FiltrosDisponiveis,
  ModeloFiltro,
  Oferta,
  OfertasQuery,
  OfertasResponse,
  OpcaoFiltro,
  Status,
} from "./types";
import { MOCK_OFERTAS, mockContatoPorId } from "./mock-ofertas";
import { prisma } from "./prisma";
import {
  buscarOfertasNoCache,
  buscarStatusNoCache,
  cacheOfertasFresco,
  listarOfertasDoCache,
  salvarCacheOfertas,
} from "./cache-ofertas";

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
let accessTokenEmCarregamento: Promise<string> | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedExpiresAt - margemSeguranca) {
    return cachedAccessToken;
  }
  if (accessTokenEmCarregamento) return accessTokenEmCarregamento;

  accessTokenEmCarregamento = carregarAccessToken();
  try {
    return await accessTokenEmCarregamento;
  } finally {
    accessTokenEmCarregamento = null;
  }
}

async function carregarAccessToken(): Promise<string> {
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

const TAMANHOS_PAGINA = new Set([10, 25, 50, 100]);
const DURACAO_CACHE_FILTROS = 60_000;
const TAMANHO_LOTE_FILTROS = 1_000;

type LinhaFiltro = Pick<Oferta, "categoria" | "condicao" | "cor" | "cidade" | "modelo" | "variante">;

let cacheFiltros: { valor: FiltrosDisponiveis; expiraEm: number } | null = null;
let filtrosEmCarregamento: Promise<FiltrosDisponiveis> | null = null;

function normalizarEspacos(valor: string) {
  return valor.replace(/\s+/g, " ").trim();
}

function extrairArmazenamento(modelo: string, variante?: string | null): string | null {
  const texto = `${modelo} ${variante ?? ""}`;
  const memoriaCombinada = texto.match(/\b\d+\s*\/\s*(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);
  const capacidade = memoriaCombinada ?? texto.match(/\b(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);

  if (!capacidade) return null;
  return `${capacidade[1].replace(",", ".")}${capacidade[2].toUpperCase()}`;
}

function extrairModeloBase(modelo: string) {
  return normalizarEspacos(
    modelo
      .replace(/\b\d+\s*\/\s*\d+(?:[.,]\d+)?\s*(GB|TB)\b/gi, " ")
      .replace(/\b\d+(?:[.,]\d+)?\s*(GB|TB)\b/gi, " ")
      .replace(/[\s\-\/|]+$/g, ""),
  );
}

function extrairEstado(cidade: string) {
  return cidade.match(/,\s*([A-Z]{2})\s*$/i)?.[1].toUpperCase() ?? "";
}

function valorPostgrest(valor: string) {
  return `"${valor.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function adicionarContagem(mapa: Map<string, { valor: string; total: number }>, valorOriginal: string) {
  const valor = normalizarEspacos(valorOriginal);
  if (!valor) return;
  const chave = valor.toLocaleLowerCase("pt-BR");
  const atual = mapa.get(chave);
  if (atual) atual.total += 1;
  else mapa.set(chave, { valor, total: 1 });
}

function ordenarOpcoes<T extends OpcaoFiltro>(opcoes: T[]) {
  return opcoes.sort((a, b) => a.valor.localeCompare(b.valor, "pt-BR", { numeric: true }));
}

function montarFiltros(linhas: LinhaFiltro[]): FiltrosDisponiveis {
  const categorias = new Map<string, OpcaoFiltro>();
  const condicoes = new Map<string, OpcaoFiltro>();
  const cores = new Map<string, OpcaoFiltro>();
  const armazenamentos = new Map<string, OpcaoFiltro>();
  const estados = new Map<string, OpcaoFiltro>();
  const cidades = new Map<string, CidadeFiltro>();
  const modelos = new Map<string, ModeloFiltro>();

  for (const linha of linhas) {
    adicionarContagem(categorias, linha.categoria);
    adicionarContagem(condicoes, linha.condicao);
    adicionarContagem(cores, linha.cor);

    const armazenamento = extrairArmazenamento(linha.modelo, linha.variante);
    if (armazenamento) adicionarContagem(armazenamentos, armazenamento);

    const estado = extrairEstado(linha.cidade);
    if (estado) adicionarContagem(estados, estado);

    const chaveCidade = linha.cidade.toLocaleLowerCase("pt-BR");
    const cidadeAtual = cidades.get(chaveCidade);
    if (cidadeAtual) cidadeAtual.total += 1;
    else if (linha.cidade && estado) cidades.set(chaveCidade, { valor: linha.cidade, estado, total: 1 });

    const modelo = extrairModeloBase(linha.modelo);
    if (modelo && linha.categoria) {
      const chaveModelo = `${linha.categoria.toLocaleLowerCase("pt-BR")}::${modelo.toLocaleLowerCase("pt-BR")}`;
      const modeloAtual = modelos.get(chaveModelo);
      if (modeloAtual) modeloAtual.total += 1;
      else modelos.set(chaveModelo, { valor: modelo, categoria: linha.categoria, total: 1 });
    }
  }

  return {
    categorias: ordenarOpcoes([...categorias.values()]),
    modelos: ordenarOpcoes([...modelos.values()]),
    condicoes: ordenarOpcoes([...condicoes.values()]),
    cores: ordenarOpcoes([...cores.values()]),
    armazenamentos: ordenarOpcoes([...armazenamentos.values()]),
    estados: ordenarOpcoes([...estados.values()]),
    cidades: ordenarOpcoes([...cidades.values()]),
    geradoEm: new Date().toISOString(),
  };
}

async function buscarTodasOfertasUpstream(): Promise<Oferta[]> {
  if (!USANDO_UPSTREAM_REAL) return [...MOCK_OFERTAS];

  const headers = await authHeaders();
  const paramsBase = { select: "*", order: "id.asc", limit: String(TAMANHO_LOTE_FILTROS) };
  const primeiraResposta = await supabase.get<Oferta[]>("/rest/v1/ofertas_publicas", {
    params: { ...paramsBase, offset: "0" },
    headers: { ...headers, Prefer: "count=exact" },
  });
  const ofertas = [...primeiraResposta.data];
  const contentRange = primeiraResposta.headers["content-range"] as string | undefined;
  const total = contentRange ? Number(contentRange.split("/")[1]) : ofertas.length;
  const offsets = Array.from(
    { length: Math.max(0, Math.ceil(total / TAMANHO_LOTE_FILTROS) - 1) },
    (_, indice) => (indice + 1) * TAMANHO_LOTE_FILTROS,
  );
  const respostas = await Promise.all(offsets.map((offset) => supabase.get<Oferta[]>("/rest/v1/ofertas_publicas", {
    params: { ...paramsBase, offset: String(offset) },
    headers,
  })));
  for (const resposta of respostas) ofertas.push(...resposta.data);
  return ofertas;
}

async function buscarStatusUpstream(): Promise<Status> {
  if (!USANDO_UPSTREAM_REAL) {
    const cidades = new Set(MOCK_OFERTAS.map((oferta) => oferta.cidade));
    return { total: MOCK_OFERTAS.length, cidades: cidades.size, fornecedores: 83 };
  }
  const headers = await authHeaders();
  const { data } = await supabase.post<Status>("/rest/v1/rpc/ofertas_stats", {}, { headers });
  return data;
}

async function buscarContatosUpstream(): Promise<Contato[]> {
  if (!USANDO_UPSTREAM_REAL) return [];
  const headers = await authHeaders();
  const { data } = await supabase.post<Contato[]>("/rest/v1/rpc/ofertas_contatos", {}, { headers });
  return data;
}

export async function atualizarCacheOfertas() {
  const contatosPromise = buscarContatosUpstream().catch((error) => {
    console.error("[cache/fornecedores]", error instanceof Error ? error.message : "Falha ao carregar fornecedores");
    return [];
  });
  const [ofertas, status, contatos] = await Promise.all([buscarTodasOfertasUpstream(), buscarStatusUpstream(), contatosPromise]);
  const fornecedores = new Map(contatos.map((contato) => [contato.id, contato.fornecedor]));
  await salvarCacheOfertas(ofertas, { ...status, total: ofertas.length }, fornecedores);
  cacheFiltros = null;
  return { total: ofertas.length, atualizadoEm: new Date().toISOString() };
}

export async function buscarOfertas(query: OfertasQuery): Promise<OfertasResponse> {
  const page = query.page && query.page > 0 ? Math.floor(query.page) : 1;
  const tamanhoSolicitado = query.itensPorPagina ?? query.pageSize ?? 25;
  const pageSize = TAMANHOS_PAGINA.has(tamanhoSolicitado) ? tamanhoSolicitado : 25;

  if (USANDO_UPSTREAM_REAL) {
    if (await cacheOfertasFresco()) return buscarOfertasNoCache(query);

    const offset = (page - 1) * pageSize;

    const params: Record<string, string> = { select: "*", offset: String(offset), limit: String(pageSize) };
    if (query.categoria) params.categoria = `eq.${query.categoria}`;
    if (query.condicao) params.condicao = `eq.${query.condicao}`;
    if (query.cor) params.cor = `eq.${query.cor}`;
    if (query.cidade) params.cidade = `eq.${query.cidade}`;
    else if (query.estado) params.cidade = `like.${valorPostgrest(`*, ${query.estado}`)}`;

    const filtrosModelo: string[] = [];
    if (query.q) filtrosModelo.push(`modelo.ilike.${valorPostgrest(`*${query.q}*`)}`);
    // A origem não expõe colunas derivadas; modelo base e capacidade precisam
    // ser traduzidos de volta para padrões sobre os campos textuais existentes.
    if (query.modelo) filtrosModelo.push(`modelo.ilike.${valorPostgrest(`${query.modelo}*`)}`);
    if (query.armazenamento) {
      const armazenamento = valorPostgrest(`*${query.armazenamento}*`);
      filtrosModelo.push(`or(modelo.ilike.${armazenamento},variante.ilike.${armazenamento})`);
    }
    if (filtrosModelo.length === 1 && !filtrosModelo[0].startsWith("or(")) {
      const [campo, operador, ...valor] = filtrosModelo[0].split(".");
      params[campo] = `${operador}.${valor.join(".")}`;
    } else if (filtrosModelo.length > 0) {
      params.and = `(${filtrosModelo.join(",")})`;
    }

    if (query.sort === "menor-preco") params.order = "valor_num.asc";
    else if (query.sort === "maior-preco") params.order = "valor_num.desc";
    else if (query.sort === "a-z") params.order = "modelo.asc";
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
  else if (query.estado) items = items.filter((o) => extrairEstado(o.cidade) === query.estado);
  if (query.modelo) items = items.filter((o) => extrairModeloBase(o.modelo) === query.modelo);
  if (query.armazenamento) {
    items = items.filter((o) => extrairArmazenamento(o.modelo, o.variante) === query.armazenamento);
  }
  if (query.q) {
    const termo = query.q.toLowerCase();
    items = items.filter((o) => o.modelo.toLowerCase().includes(termo));
  }

  if (query.sort === "menor-preco") items.sort((a, b) => a.valor_num - b.valor_num);
  else if (query.sort === "maior-preco") items.sort((a, b) => b.valor_num - a.valor_num);
  else if (query.sort === "a-z") items.sort((a, b) => a.modelo.localeCompare(b.modelo, "pt-BR", { numeric: true }));
  else items.sort((a, b) => b.id - a.id);

  const total = items.length;
  const start = (page - 1) * pageSize;
  const paginado = items.slice(start, start + pageSize);

  return { items: paginado, total, page, pageSize };
}

export async function buscarFiltrosDisponiveis(): Promise<FiltrosDisponiveis> {
  if (cacheFiltros && Date.now() < cacheFiltros.expiraEm) return cacheFiltros.valor;
  if (filtrosEmCarregamento) return filtrosEmCarregamento;

  filtrosEmCarregamento = (async () => {
    let linhas: LinhaFiltro[];

    if (USANDO_UPSTREAM_REAL && await cacheOfertasFresco()) {
      linhas = await listarOfertasDoCache();
    } else if (USANDO_UPSTREAM_REAL) {
      const headers = await authHeaders();
      const paramsBase = {
        select: "categoria,condicao,cor,cidade,modelo,variante",
        order: "id.asc",
        limit: String(TAMANHO_LOTE_FILTROS),
      };
      const primeiraResposta = await supabase.get<LinhaFiltro[]>("/rest/v1/ofertas_publicas", {
        params: { ...paramsBase, offset: "0" },
        headers: { ...headers, Prefer: "count=exact" },
      });
      linhas = primeiraResposta.data;

      const contentRange = primeiraResposta.headers["content-range"] as string | undefined;
      const total = contentRange ? Number(contentRange.split("/")[1]) : linhas.length;
      const offsets = Array.from(
        { length: Math.max(0, Math.ceil(total / TAMANHO_LOTE_FILTROS) - 1) },
        (_, indice) => (indice + 1) * TAMANHO_LOTE_FILTROS,
      );

      // Depois de conhecer o total, os lotes independentes são buscados juntos
      // para a rota não exceder o tempo de execução da hospedagem.
      const respostasRestantes = await Promise.all(
        offsets.map((offset) => supabase.get<LinhaFiltro[]>("/rest/v1/ofertas_publicas", {
          params: { ...paramsBase, offset: String(offset) },
          headers,
        })),
      );
      for (const resposta of respostasRestantes) linhas.push(...resposta.data);
    } else {
      linhas = MOCK_OFERTAS;
    }

    const valor = montarFiltros(linhas);
    cacheFiltros = { valor, expiraEm: Date.now() + DURACAO_CACHE_FILTROS };
    return valor;
  })();

  try {
    return await filtrosEmCarregamento;
  } finally {
    filtrosEmCarregamento = null;
  }
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
    if (await cacheOfertasFresco()) {
      const status = await buscarStatusNoCache();
      if (status) return status;
    }
    return buscarStatusUpstream();
  }
  return buscarStatusUpstream();
}
