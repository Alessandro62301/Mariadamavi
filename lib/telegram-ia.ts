import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

const CATEGORIAS = ["iphone", "ipad", "macbook", "watch", "acessorios", "eletronicos"] as const;
const LIMITE_MENSAGEM = 500;
const LIMITE_RESULTADOS = 5;
const VALIDADE_CONTEXTO_MS = 2 * 60 * 60 * 1_000;

type Categoria = typeof CATEGORIAS[number];

type ContextoBusca = {
  categoria: Categoria | null;
  modelo: string | null;
  cor: string | null;
  armazenamento: string | null;
  condicao: string | null;
  cidade: string | null;
  precoMaximo: number | null;
  aceitaQualquerArmazenamento: boolean;
  aceitaQualquerCondicao: boolean;
  aceitaQualquerCor: boolean;
  pendente: "armazenamento" | "condicao" | "cor" | null;
};

type Interpretacao = ContextoBusca & {
  acao: "buscar" | "ajuda" | "limpar" | "alerta" | "conversar";
  resposta: string;
};

type RespostaOpenAI = {
  id?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

export type ResultadoConversa = {
  texto: string;
  contexto: ContextoBusca | null;
};

const CONTEXTO_VAZIO: ContextoBusca = {
  categoria: null,
  modelo: null,
  cor: null,
  armazenamento: null,
  condicao: null,
  cidade: null,
  precoMaximo: null,
  aceitaQualquerArmazenamento: false,
  aceitaQualquerCondicao: false,
  aceitaQualquerCor: false,
  pendente: null,
};

function textoDaResposta(resposta: RespostaOpenAI) {
  for (const item of resposta.output ?? []) {
    for (const conteudo of item.content ?? []) {
      if (conteudo.type === "output_text" && conteudo.text) return conteudo.text;
    }
  }
  return null;
}

function contextoValido(valor: Prisma.JsonValue | null, atualizadoEm: Date): ContextoBusca {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return CONTEXTO_VAZIO;
  if (Date.now() - atualizadoEm.getTime() > VALIDADE_CONTEXTO_MS) return CONTEXTO_VAZIO;
  const item = valor as Record<string, Prisma.JsonValue>;
  const categoria = typeof item.categoria === "string" && CATEGORIAS.includes(item.categoria as Categoria)
    ? item.categoria as Categoria
    : null;
  return {
    categoria,
    modelo: typeof item.modelo === "string" ? item.modelo : null,
    cor: typeof item.cor === "string" ? item.cor : null,
    armazenamento: typeof item.armazenamento === "string" ? item.armazenamento : null,
    condicao: typeof item.condicao === "string" ? item.condicao : null,
    cidade: typeof item.cidade === "string" ? item.cidade : null,
    precoMaximo: typeof item.precoMaximo === "number" && item.precoMaximo > 0 ? item.precoMaximo : null,
    aceitaQualquerArmazenamento: item.aceitaQualquerArmazenamento === true,
    aceitaQualquerCondicao: item.aceitaQualquerCondicao === true,
    aceitaQualquerCor: item.aceitaQualquerCor === true,
    pendente: item.pendente === "armazenamento" || item.pendente === "condicao" || item.pendente === "cor"
      ? item.pendente
      : null,
  };
}

function limparTexto(valor: unknown, limite = 100) {
  if (typeof valor !== "string") return null;
  const texto = valor.replace(/\s+/g, " ").trim();
  return texto ? texto.slice(0, limite) : null;
}

function validarInterpretacao(valor: unknown, contextoAnterior: ContextoBusca): Interpretacao {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) throw new Error("Resposta estruturada inválida.");
  const item = valor as Record<string, unknown>;
  const acoes = new Set(["buscar", "ajuda", "limpar", "alerta", "conversar"]);
  const categoria = typeof item.categoria === "string" && CATEGORIAS.includes(item.categoria as Categoria)
    ? item.categoria as Categoria
    : null;
  return {
    acao: acoes.has(String(item.acao)) ? item.acao as Interpretacao["acao"] : "conversar",
    categoria,
    modelo: limparTexto(item.modelo),
    cor: limparTexto(item.cor),
    armazenamento: limparTexto(item.armazenamento, 32)?.replace(/\s+/g, "").toUpperCase() ?? null,
    condicao: limparTexto(item.condicao, 32),
    cidade: limparTexto(item.cidade),
    precoMaximo: typeof item.precoMaximo === "number" && Number.isFinite(item.precoMaximo) && item.precoMaximo > 0
      ? item.precoMaximo
      : null,
    aceitaQualquerArmazenamento: contextoAnterior.aceitaQualquerArmazenamento,
    aceitaQualquerCondicao: contextoAnterior.aceitaQualquerCondicao,
    aceitaQualquerCor: contextoAnterior.aceitaQualquerCor,
    pendente: contextoAnterior.pendente,
    resposta: limparTexto(item.resposta, 300) ?? "O que você gostaria de consultar?",
  };
}

function aplicarFiltrosExplicitos(
  mensagem: string,
  interpretacao: Interpretacao,
  contextoAnterior: ContextoBusca,
): Interpretacao {
  const texto = mensagem.toLocaleLowerCase("pt-BR");
  const resultado = { ...interpretacao };
  const respostaGenerica = /^\s*(qualquer|tanto faz|indiferente)\s*[.!]?\s*$/i.test(texto);

  if (resultado.modelo !== contextoAnterior.modelo) {
    resultado.aceitaQualquerArmazenamento = false;
    resultado.aceitaQualquerCondicao = false;
    resultado.aceitaQualquerCor = false;
  }

  if (/\bqualquer\s+(?:capacidade|armazenamento|mem[oó]ria)\b/i.test(texto)
    || (respostaGenerica && contextoAnterior.pendente === "armazenamento")) {
    resultado.armazenamento = null;
    resultado.aceitaQualquerArmazenamento = true;
  } else {
    const capacidadeComUnidade = texto.match(/\b(\d+(?:[.,]\d+)?)\s*(gb|tb)\b/i);
    const capacidadeSemUnidade = texto.match(/\b(32|64|128|256|512|1024|2048)\b/);
    if (capacidadeComUnidade) {
      resultado.armazenamento = `${capacidadeComUnidade[1].replace(",", ".")}${capacidadeComUnidade[2].toUpperCase()}`;
      resultado.aceitaQualquerArmazenamento = false;
    } else if (capacidadeSemUnidade) {
      const numero = Number(capacidadeSemUnidade[1]);
      resultado.armazenamento = numero >= 1024 ? `${numero / 1024}TB` : `${numero}GB`;
      resultado.aceitaQualquerArmazenamento = false;
    }
  }

  if (/\bqualquer\s+condi[cç][aã]o\b/i.test(texto)
    || (respostaGenerica && contextoAnterior.pendente === "condicao")) {
    resultado.condicao = null;
    resultado.aceitaQualquerCondicao = true;
  } else if (/\b(usad[oa]|seminov[oa])\b/i.test(texto)) {
    resultado.condicao = "Usado";
    resultado.aceitaQualquerCondicao = false;
  } else if (!/\bde\s+novo\b/i.test(texto) && /\b(nov[oa]|lacrad[oa]|zero)\b/i.test(texto)) {
    resultado.condicao = "Novo";
    resultado.aceitaQualquerCondicao = false;
  }

  if (/\bqualquer\s+cor\b/i.test(texto)
    || (respostaGenerica && contextoAnterior.pendente === "cor")) {
    resultado.cor = null;
    resultado.aceitaQualquerCor = true;
  } else if (contextoAnterior.pendente === "cor" && mensagem.length <= 40) {
    resultado.cor = mensagem.replace(/^cor\s*[:=-]?\s*/i, "").trim();
    resultado.aceitaQualquerCor = false;
  } else if (resultado.cor) {
    resultado.aceitaQualquerCor = false;
  }

  if (contextoAnterior.pendente) resultado.acao = "buscar";
  resultado.pendente = null;
  return resultado;
}

async function interpretarMensagem(mensagem: string, contexto: ContextoBusca): Promise<Interpretacao> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada.");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.4",
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 800,
      instructions: [
        "Você interpreta mensagens em português para o buscador de produtos Apple MARIADAMAVI.",
        "Retorne os filtros completos da conversa, combinando a mensagem atual com o contexto fornecido.",
        "Se o contexto tiver um campo pendente, interprete a resposta curta como resposta para esse campo e mantenha os demais filtros.",
        "Corrija erros comuns como aifone para iPhone e relógio Apple para categoria watch.",
        "Use categoria somente entre iphone, ipad, macbook, watch, acessorios e eletronicos.",
        "Use acao buscar quando houver produto ou filtro suficiente para consultar.",
        "Use conversar para saudações ou quando precisar perguntar qual produto o usuário procura.",
        "Use alerta quando o usuário pedir para ser avisado. Use limpar quando pedir para recomeçar.",
        "Números de capacidade como 128, 256 ou 512 sem unidade significam GB; 1TB e 2TB permanecem TB.",
        "Mantenha modelo sem capacidade, cor ou condição: por exemplo, modelo iPhone 17 Pro e armazenamento 512GB.",
        "Nunca invente preços, disponibilidade ou lojas; esses dados virão do banco.",
        "Quando o usuário disser qualquer cor, capacidade ou condição, retorne null nesse filtro.",
      ].join(" "),
      input: `Contexto atual: ${JSON.stringify(contexto)}\nMensagem do usuário: ${mensagem}`,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "consulta_catalogo",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              acao: { type: "string", enum: ["buscar", "ajuda", "limpar", "alerta", "conversar"] },
              categoria: { type: ["string", "null"], enum: [...CATEGORIAS, null] },
              modelo: { type: ["string", "null"] },
              cor: { type: ["string", "null"] },
              armazenamento: { type: ["string", "null"] },
              condicao: { type: ["string", "null"] },
              cidade: { type: ["string", "null"] },
              precoMaximo: { type: ["number", "null"] },
              resposta: { type: "string" },
            },
            required: ["acao", "categoria", "modelo", "cor", "armazenamento", "condicao", "cidade", "precoMaximo", "resposta"],
          },
        },
      },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`OpenAI respondeu ${response.status}.`);
  const resposta = await response.json() as RespostaOpenAI;
  const texto = textoDaResposta(resposta);
  if (!texto) throw new Error("OpenAI não retornou texto estruturado.");
  return aplicarFiltrosExplicitos(mensagem, validarInterpretacao(JSON.parse(texto), contexto), contexto);
}

function linkCatalogo(contexto: ContextoBusca) {
  const params = new URLSearchParams({ sort: "menor-preco" });
  if (contexto.categoria) params.set("categoria", contexto.categoria);
  if (contexto.modelo) params.set("q", contexto.modelo);
  if (contexto.cor) params.set("cor", contexto.cor);
  if (contexto.armazenamento) params.set("armazenamento", contexto.armazenamento);
  if (contexto.condicao) params.set("condicao", contexto.condicao);
  if (contexto.cidade) params.set("cidade", contexto.cidade);
  const appUrl = (process.env.APP_URL || "https://mariadamavi.com.br").replace(/\/$/, "");
  return `${appUrl}/buscador?${params.toString()}`;
}

async function filtroDoModelo(contexto: ContextoBusca): Promise<Prisma.OfertaCacheWhereInput> {
  const modeloExato = contexto.modelo
    ? await prisma.ofertaCache.findFirst({
      where: { modeloBase: contexto.modelo },
      select: { modeloBase: true },
    })
    : null;
  return contexto.modelo
    ? modeloExato
      ? { modeloBase: modeloExato.modeloBase }
      : { modelo: { contains: contexto.modelo } }
    : {};
}

function listarOpcoes(opcoes: string[], limite = 8) {
  const ordenadas = [...opcoes].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  const exibidas = ordenadas.slice(0, limite);
  return `${exibidas.join(", ")}${ordenadas.length > limite ? "..." : ""}`;
}

async function prepararEspecificacoes(contextoOriginal: ContextoBusca) {
  const contexto: ContextoBusca = { ...contextoOriginal, pendente: null };
  if (!contexto.modelo) return { contexto, pergunta: null as string | null };

  const base: Prisma.OfertaCacheWhereInput = {
    ...(contexto.categoria ? { categoria: contexto.categoria } : {}),
    ...(await filtroDoModelo(contexto)),
    ...(contexto.cidade ? { cidade: { contains: contexto.cidade } } : {}),
    ...(contexto.precoMaximo ? { valorNum: { lte: contexto.precoMaximo } } : {}),
  };

  if (!contexto.armazenamento && !contexto.aceitaQualquerArmazenamento) {
    const registros = await prisma.ofertaCache.findMany({
      where: { ...base, armazenamento: { not: null } },
      distinct: ["armazenamento"],
      select: { armazenamento: true },
    });
    const opcoes = registros.flatMap((item) => item.armazenamento ? [item.armazenamento] : []);
    if (opcoes.length === 1) contexto.armazenamento = opcoes[0];
    else if (opcoes.length > 1) {
      contexto.pendente = "armazenamento";
      return {
        contexto,
        pergunta: `Qual capacidade você procura?\nOpções: ${listarOpcoes(opcoes)}.\nResponda uma opção ou "qualquer capacidade".`,
      };
    }
  }

  const comArmazenamento: Prisma.OfertaCacheWhereInput = {
    ...base,
    ...(contexto.armazenamento ? { armazenamento: contexto.armazenamento } : {}),
  };
  if (!contexto.condicao && !contexto.aceitaQualquerCondicao) {
    const registros = await prisma.ofertaCache.findMany({
      where: comArmazenamento,
      distinct: ["condicao"],
      select: { condicao: true },
    });
    const opcoes = registros.map((item) => item.condicao).filter(Boolean);
    if (opcoes.length === 1) contexto.condicao = opcoes[0];
    else if (opcoes.length > 1) {
      contexto.pendente = "condicao";
      return {
        contexto,
        pergunta: `Você prefere novo ou usado?\nOpções: ${listarOpcoes(opcoes)}.\nVocê também pode responder "qualquer condição".`,
      };
    }
  }

  const comCondicao: Prisma.OfertaCacheWhereInput = {
    ...comArmazenamento,
    ...(contexto.condicao ? { condicao: contexto.condicao } : {}),
  };
  if (!contexto.cor && !contexto.aceitaQualquerCor) {
    const registros = await prisma.ofertaCache.findMany({
      where: comCondicao,
      distinct: ["cor"],
      select: { cor: true },
    });
    const opcoes = registros.map((item) => item.cor).filter(Boolean);
    if (opcoes.length === 1) contexto.cor = opcoes[0];
    else if (opcoes.length > 1) {
      contexto.pendente = "cor";
      return {
        contexto,
        pergunta: `Qual cor você quer?\nOpções: ${listarOpcoes(opcoes)}.\nResponda uma cor ou "qualquer cor".`,
      };
    }
  }

  return { contexto, pergunta: null as string | null };
}

async function buscarOfertas(contexto: ContextoBusca) {
  const where: Prisma.OfertaCacheWhereInput = {
    ...(contexto.categoria ? { categoria: contexto.categoria } : {}),
    ...(await filtroDoModelo(contexto)),
    ...(contexto.cor ? { cor: { contains: contexto.cor } } : {}),
    ...(contexto.armazenamento ? { armazenamento: contexto.armazenamento } : {}),
    ...(contexto.condicao ? { condicao: { contains: contexto.condicao } } : {}),
    ...(contexto.cidade ? { cidade: { contains: contexto.cidade } } : {}),
    ...(contexto.precoMaximo ? { valorNum: { lte: contexto.precoMaximo } } : {}),
  };
  const [ofertas, total] = await Promise.all([
    prisma.ofertaCache.findMany({ where, orderBy: { valorNum: "asc" }, take: LIMITE_RESULTADOS }),
    prisma.ofertaCache.count({ where }),
  ]);
  return { ofertas, total };
}

function resumoFiltros(contexto: ContextoBusca) {
  const partes = [
    contexto.modelo,
    contexto.armazenamento || (contexto.aceitaQualquerArmazenamento ? "qualquer capacidade" : null),
    contexto.cor || (contexto.aceitaQualquerCor ? "qualquer cor" : null),
    contexto.condicao || (contexto.aceitaQualquerCondicao ? "novo ou usado" : null),
    contexto.cidade,
    contexto.precoMaximo ? `até ${contexto.precoMaximo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : null,
  ].filter(Boolean);
  return partes.length ? partes.join(" · ") : contexto.categoria || "todos os produtos";
}

function formatarResultados(contexto: ContextoBusca, resultado: Awaited<ReturnType<typeof buscarOfertas>>) {
  if (resultado.total === 0) {
    return [
      `Entendi: ${resumoFiltros(contexto)}.`,
      "",
      "Não encontrei ofertas com esses filtros.",
      "Você pode retirar uma cor, capacidade ou limite de preço e tentar novamente.",
      "",
      linkCatalogo(contexto),
    ].join("\n");
  }

  const linhas = resultado.ofertas.flatMap((oferta, indice) => [
    `${indice + 1}. ${oferta.modelo}`,
    `${oferta.valor} · ${oferta.condicao}${oferta.cor ? ` · ${oferta.cor}` : ""}`,
    [oferta.fornecedor, oferta.cidade].filter(Boolean).join(" · "),
    "",
  ]);
  return [
    `Entendi: ${resumoFiltros(contexto)}.`,
    "",
    `Encontrei ${resultado.total.toLocaleString("pt-BR")} oferta${resultado.total === 1 ? "" : "s"}.`,
    "Estas são as mais baratas:",
    "",
    ...linhas,
    `Ver no catálogo: ${linkCatalogo(contexto)}`,
  ].join("\n").slice(0, 4096);
}

export function ajudaTelegram() {
  return [
    "Pode falar comigo normalmente sobre o produto que procura.",
    "",
    "Exemplos:",
    "Quanto está o iPhone 15 Pro 256GB?",
    "Tem Apple Watch por até 2 mil?",
    "E na cor preta?",
    "",
    "/limpar — começar uma nova busca",
    "/alertas — abrir a configuração de alertas",
    "/ajuda — ver esta mensagem",
  ].join("\n");
}

export async function processarConversaTelegram(
  vinculo: { contextoBusca: Prisma.JsonValue | null; atualizadoEm: Date },
  mensagemOriginal: string,
): Promise<ResultadoConversa> {
  const mensagem = mensagemOriginal.replace(/\s+/g, " ").trim().slice(0, LIMITE_MENSAGEM);
  const contextoAnterior = contextoValido(vinculo.contextoBusca, vinculo.atualizadoEm);
  const interpretacao = await interpretarMensagem(mensagem, contextoAnterior);
  const contexto: ContextoBusca = {
    categoria: interpretacao.categoria,
    modelo: interpretacao.modelo,
    cor: interpretacao.cor,
    armazenamento: interpretacao.armazenamento,
    condicao: interpretacao.condicao,
    cidade: interpretacao.cidade,
    precoMaximo: interpretacao.precoMaximo,
    aceitaQualquerArmazenamento: interpretacao.aceitaQualquerArmazenamento,
    aceitaQualquerCondicao: interpretacao.aceitaQualquerCondicao,
    aceitaQualquerCor: interpretacao.aceitaQualquerCor,
    pendente: interpretacao.pendente,
  };

  if (interpretacao.acao === "limpar") return { texto: "Conversa limpa. Qual produto você quer procurar?", contexto: null };
  if (interpretacao.acao === "ajuda") return { texto: ajudaTelegram(), contexto };
  if (interpretacao.acao === "alerta") {
    const appUrl = (process.env.APP_URL || "https://mariadamavi.com.br").replace(/\/$/, "");
    return { texto: `Configure o alerta com estes filtros no sistema:\n${appUrl}/buscador/configuracoes`, contexto };
  }
  if (interpretacao.acao !== "buscar") return { texto: interpretacao.resposta, contexto };

  const especificacoes = await prepararEspecificacoes(contexto);
  if (especificacoes.pergunta) return { texto: especificacoes.pergunta, contexto: especificacoes.contexto };

  const resultado = await buscarOfertas(especificacoes.contexto);
  return { texto: formatarResultados(especificacoes.contexto, resultado), contexto: especificacoes.contexto };
}
