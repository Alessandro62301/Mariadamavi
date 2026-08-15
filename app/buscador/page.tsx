"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FiltrosDisponiveis, Oferta, OfertasResponse } from "@/lib/types";
import { WhatsAppIcon } from "@/components/icons";
import Link from "next/link";
import { SelectDropdown } from "@/components/select-dropdown";

const CATEGORIAS = ["iphone", "ipad", "macbook", "watch", "acessorios", "eletronicos"];
const ROTULOS_CATEGORIA: Record<string, string> = {
  iphone: "iPhone",
  ipad: "iPad",
  macbook: "MacBook",
  watch: "Apple Watch",
  acessorios: "Acessórios",
  eletronicos: "Eletrônicos",
};
const ROTULOS_SORT: Record<string, string> = {
  "menor-preco": "menor preço",
  recentes: "mais recentes",
  "maior-margem": "maior margem",
};

function extrairArmazenamento(modelo: string, variante?: string | null) {
  const texto = `${modelo} ${variante ?? ""}`;
  const combinada = texto.match(/\b\d+\s*\/\s*(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);
  const capacidade = combinada ?? texto.match(/\b(\d+(?:[.,]\d+)?)\s*(GB|TB)\b/i);
  return capacidade ? `${capacidade[1].replace(",", ".")}${capacidade[2].toUpperCase()}` : "";
}

function extrairModeloBase(modelo: string) {
  return modelo
    .replace(/\b\d+\s*\/\s*\d+(?:[.,]\d+)?\s*(GB|TB)\b/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(GB|TB)\b/gi, " ")
    .replace(/[\s\-\/|]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extrairEstado(cidade: string) {
  return cidade.match(/,\s*([A-Z]{2})\s*$/i)?.[1].toUpperCase() ?? "";
}

function opcoesComContagem(valores: string[]) {
  const contagens = new Map<string, { valor: string; total: number }>();
  for (const valorOriginal of valores) {
    const valor = valorOriginal?.trim();
    if (!valor) continue;
    const chave = valor.toLocaleLowerCase("pt-BR");
    const atual = contagens.get(chave);
    if (atual) atual.total += 1;
    else contagens.set(chave, { valor, total: 1 });
  }
  return [...contagens.values()].sort((a, b) => a.valor.localeCompare(b.valor, "pt-BR", { numeric: true }));
}

function numeroPositivo(valor: string | null, padrao: number) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : padrao;
}

function paginasVisiveis(atual: number, total: number) {
  const inicio = Math.max(1, Math.min(atual - 3, total - 6));
  const fim = Math.min(total, inicio + 6);
  return Array.from({ length: fim - inicio + 1 }, (_, indice) => inicio + indice);
}

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function RotuloComTotal({ valor, total }: { valor: string; total: number }) {
  return <>{valor} — {total.toLocaleString("pt-BR")}</>;
}

function corSwatch(cor: string) {
  const chave = cor.toLocaleLowerCase("pt-BR");
  if (chave.includes("azul")) return "#2b3a5c";
  if (chave.includes("preto") || chave.includes("black")) return "#26232a";
  if (chave.includes("prata") || chave.includes("silver")) return "#d8d5d0";
  if (chave.includes("laranja") || chave.includes("orange")) return "#d0612a";
  if (chave.includes("dourado") || chave.includes("gold")) return "#c9ad7a";
  if (chave.includes("verde") || chave.includes("green")) return "#3f5b46";
  if (chave.includes("rosa") || chave.includes("pink")) return "#d9a3b3";
  if (chave.includes("roxo") || chave.includes("purple") || chave.includes("lilás")) return "#5b4a72";
  if (chave.includes("branco") || chave.includes("white")) return "#eee9e2";
  return "#8a7f88";
}

function BuscadorConteudo() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoria = searchParams.get("categoria") ?? "iphone";
  const modelo = searchParams.get("modelo") ?? "";
  const condicao = searchParams.get("condicao") ?? "";
  const cor = searchParams.get("cor") ?? "";
  const armazenamento = searchParams.get("armazenamento") ?? "";
  const estado = searchParams.get("estado") ?? "";
  const cidade = searchParams.get("cidade") ?? "";
  const fornecedor = searchParams.get("fornecedor") ?? "";
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "menor-preco";
  const page = numeroPositivo(searchParams.get("page"), 1);
  const itensPorPagina = 25;

  const [todasOfertas, setTodasOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [contatoCarregando, setContatoCarregando] = useState<number | null>(null);
  const [buscaTexto, setBuscaTexto] = useState(q);
  const [markup, setMarkup] = useState(12);

  const alterarFiltro = useCallback((nome: string, valor: string, opcoes?: { manterPagina?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(nome, valor);
    else params.delete(nome);

    if (!opcoes?.manterPagina) params.delete("page");
    const destino = params.size ? `${pathname}?${params.toString()}` : pathname;
    router.replace(destino, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        const [ofertasResponse, configuracoesResponse] = await Promise.all([
          fetch("/api/buscador/ofertas", { signal: controller.signal }),
          fetch("/api/buscador/configuracoes", { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        if (ofertasResponse.status === 401 || configuracoesResponse.status === 401) {
          router.push("/buscador/login");
          return;
        }
        if (!ofertasResponse.ok || !configuracoesResponse.ok) throw new Error("Falha ao carregar o catálogo.");
        const [catalogo, configuracoes] = await Promise.all([
          ofertasResponse.json() as Promise<OfertasResponse>,
          configuracoesResponse.json(),
        ]);
        if (controller.signal.aborted) return;
        setTodasOfertas(catalogo.items);
        const paramsAtuais = new URLSearchParams(window.location.search);
        if (!paramsAtuais.has("categoria")) {
          const params = new URLSearchParams(paramsAtuais);
          params.set("categoria", configuracoes.preferencias.categoriaPadrao);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErro("Não foi possível carregar o catálogo.");
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregar();
    return () => controller.abort("component-cleanup");
  }, [pathname, router]);

  useEffect(() => {
    const salvo = window.localStorage.getItem("buscador-markup");
    if (salvo && !Number.isNaN(Number(salvo))) setMarkup(Number(salvo));
  }, []);

  function mudarMarkup(valor: number) {
    setMarkup(valor);
    window.localStorage.setItem("buscador-markup", String(valor));
  }

  const status = useMemo(() => ({
    total: todasOfertas.length,
    fornecedores: new Set(todasOfertas.map((oferta) => oferta.fornecedor?.trim()).filter(Boolean)).size,
    cidades: new Set(todasOfertas.map((oferta) => oferta.cidade.trim()).filter(Boolean)).size,
    estados: new Set(todasOfertas.map((oferta) => extrairEstado(oferta.cidade)).filter(Boolean)).size,
  }), [todasOfertas]);

  const melhorPreco = useMemo(() => {
    if (todasOfertas.length === 0) return null;
    return todasOfertas.reduce((menor, atual) => (atual.valor_num < menor.valor_num ? atual : menor));
  }, [todasOfertas]);

  const filtros = useMemo<FiltrosDisponiveis>(() => {
    const categorias = CATEGORIAS.map((valor) => ({
      valor,
      total: todasOfertas.filter((oferta) => oferta.categoria === valor).length,
    }));
    const modelos = CATEGORIAS.flatMap((categoriaAtual) =>
      opcoesComContagem(todasOfertas.filter((oferta) => oferta.categoria === categoriaAtual).map((oferta) => extrairModeloBase(oferta.modelo)))
        .map((item) => ({ ...item, categoria: categoriaAtual })),
    );
    const cidades = opcoesComContagem(todasOfertas.map((oferta) => oferta.cidade)).map((item) => ({
      ...item,
      estado: extrairEstado(item.valor),
    }));
    return {
      categorias,
      modelos,
      condicoes: opcoesComContagem(todasOfertas.map((oferta) => oferta.condicao)),
      cores: opcoesComContagem(todasOfertas.map((oferta) => oferta.cor)),
      armazenamentos: opcoesComContagem(todasOfertas.map((oferta) => extrairArmazenamento(oferta.modelo, oferta.variante))),
      estados: opcoesComContagem(todasOfertas.map((oferta) => extrairEstado(oferta.cidade))),
      cidades,
      geradoEm: new Date().toISOString(),
    };
  }, [todasOfertas]);

  const fornecedoresDisponiveis = useMemo(
    () => opcoesComContagem(todasOfertas.map((oferta) => oferta.fornecedor ?? "")),
    [todasOfertas],
  );

  const itensFiltrados = useMemo(() => {
    const termoBusca = buscaTexto.trim().toLocaleLowerCase("pt-BR");
    return todasOfertas.filter((oferta) => {
      if (!termoBusca && categoria && oferta.categoria !== categoria) return false;
      if (modelo && extrairModeloBase(oferta.modelo) !== modelo) return false;
      if (condicao && oferta.condicao !== condicao) return false;
      if (cor && oferta.cor !== cor) return false;
      if (armazenamento && extrairArmazenamento(oferta.modelo, oferta.variante) !== armazenamento) return false;
      if (estado && extrairEstado(oferta.cidade) !== estado) return false;
      if (cidade && oferta.cidade !== cidade) return false;
      if (fornecedor && oferta.fornecedor !== fornecedor) return false;
      if (termoBusca) {
        const alvo = `${oferta.modelo} ${oferta.fornecedor ?? ""} ${oferta.cor}`.toLocaleLowerCase("pt-BR");
        if (!alvo.includes(termoBusca)) return false;
      }
      return true;
    });
  }, [armazenamento, buscaTexto, categoria, cidade, condicao, cor, estado, fornecedor, modelo, todasOfertas]);

  const menorCustoPorGrupo = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const oferta of itensFiltrados) {
      const chave = `${oferta.modelo}__${extrairArmazenamento(oferta.modelo, oferta.variante)}`;
      const atual = mapa.get(chave);
      if (atual === undefined || oferta.valor_num < atual) mapa.set(chave, oferta.valor_num);
    }
    return mapa;
  }, [itensFiltrados]);

  const resultado = useMemo<OfertasResponse>(() => {
    let items = [...itensFiltrados].sort((a, b) => {
      if (sort === "menor-preco") return a.valor_num - b.valor_num;
      if (sort === "maior-margem") return b.valor_num - a.valor_num;
      return b.id - a.id;
    });
    const total = items.length;
    const inicio = (page - 1) * itensPorPagina;
    return { items: items.slice(inicio, inicio + itensPorPagina), total, page, pageSize: itensPorPagina };
  }, [itensFiltrados, itensPorPagina, page, sort]);

  const cidadesDoEstado = useMemo(() => {
    return filtros.cidades.filter((item) => !estado || item.estado === estado);
  }, [estado, filtros.cidades]);

  const totalPaginas = Math.max(1, Math.ceil(resultado.total / resultado.pageSize));

  function mudarCategoria(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set("categoria", valor);
    else params.delete("categoria");
    params.delete("modelo");
    params.delete("page");
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  function mudarEstado(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set("estado", valor);
    else params.delete("estado");
    params.delete("cidade");
    params.delete("page");
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  function confirmarBusca(valor?: string) {
    const texto = (valor ?? buscaTexto).trim();
    if (texto === q) return;
    alterarFiltro("q", texto);
  }

  async function abrirWhatsApp(oferta: Oferta) {
    setContatoCarregando(oferta.id);
    try {
      const response = await fetch(`/api/buscador/ofertas/${oferta.id}/contato`);
      if (response.status === 401) {
        router.push("/buscador/login");
        return;
      }
      if (!response.ok) throw new Error("Contato indisponível.");
      const contato = await response.json();
      const url = new URL(contato.whatsapp_url);
      url.searchParams.set("text", `Oi! Vi o ${oferta.modelo} (${oferta.cor}, ${oferta.condicao}) por ${oferta.valor}.`);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch {
      setErro("Não foi possível abrir o contato desta oferta.");
    } finally {
      setContatoCarregando(null);
    }
  }

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/buscador/login");
  }

  return (
    <div className="busca-shell">
      <header className="busca-header">
        <span className="wordmark busca-header__marca">MARIADAMAVI</span>
        <nav className="busca-header__tabs" aria-label="Navegação do app">
          <span className="busca-header__tab busca-header__tab--ativa">Produtos</span>
          <Link className="busca-header__tab" href="/fornecedores">Fornecedores</Link>
          <span className="busca-header__tab busca-header__tab--desativada">Preços do dia</span>
          <span className="busca-header__tab busca-header__tab--desativada">Minhas listas</span>
        </nav>
        <div className="busca-header__spacer" />
        {!carregando && <span className="busca-header__atualizado">{status.total.toLocaleString("pt-BR")} ofertas no catálogo</span>}
        <Link className="config-link" href="/buscador/configuracoes">Configurações</Link>
        <button type="button" className="logout" onClick={sair}>Sair</button>
        <div className="busca-header__conta">
          <span className="busca-header__avatar" aria-hidden="true">M</span>
          <span className="busca-header__nome">Maria</span>
        </div>
      </header>

      <main className="busca-body">
        {erro && <div className="catalogo-erro" role="alert">{erro}</div>}

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-card__rotulo">Ofertas no catálogo</span>
            <span className="kpi-card__valor-linha">
              <span className="kpi-card__valor">{status.total.toLocaleString("pt-BR")}</span>
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__rotulo">Fornecedores ativos</span>
            <span className="kpi-card__valor-linha">
              <span className="kpi-card__valor">{status.fornecedores.toLocaleString("pt-BR")}</span>
              <Link href="/fornecedores" className="kpi-card__link">ver no mapa ›</Link>
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__rotulo">Cidades</span>
            <span className="kpi-card__valor-linha">
              <span className="kpi-card__valor">{status.cidades.toLocaleString("pt-BR")}</span>
              <span className="kpi-card__nota">em {status.estados} estados</span>
            </span>
          </div>
          <div className="kpi-card kpi-card--escuro">
            <span className="kpi-card__rotulo">{melhorPreco ? `Melhor preço ${extrairModeloBase(melhorPreco.modelo)}` : "Melhor preço do catálogo"}</span>
            <span className="kpi-card__valor kpi-card__valor--rosa">{melhorPreco ? melhorPreco.valor : "—"}</span>
          </div>
        </div>

        <div className="filtro-bar">
          <div className="filtro-bar__linha1">
            <div className="filtro-bar__busca">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" /></svg>
              <input
                type="search"
                aria-label="Buscar modelo, capacidade ou fornecedor"
                placeholder="Buscar modelo, capacidade ou fornecedor…"
                value={buscaTexto}
                onChange={(event) => {
                  setBuscaTexto(event.target.value);
                  if (!event.target.value) alterarFiltro("q", "");
                }}
                onBlur={() => confirmarBusca()}
                onKeyDown={(event) => { if (event.key === "Enter") confirmarBusca(); }}
              />
            </div>
            <div className="filtro-bar__markup">
              <span>Meu markup</span>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={markup}
                aria-label="Markup aplicado à venda sugerida"
                onChange={(event) => mudarMarkup(Number(event.target.value))}
              />
              <b>{markup}%</b>
            </div>
          </div>

          <div className="filtro-bar__categorias">
            <button type="button" className={!categoria ? "ativo" : ""} onClick={() => mudarCategoria("")}>Todos</button>
            {filtros.categorias.map((item) => (
              <button
                type="button"
                key={item.valor}
                className={categoria === item.valor ? "ativo" : ""}
                onClick={() => mudarCategoria(item.valor)}
              >
                {ROTULOS_CATEGORIA[item.valor] ?? item.valor} · {item.total.toLocaleString("pt-BR")}
              </button>
            ))}
          </div>

          <div className="filtro-bar__selects">
            <div>
              <span>Condição</span>
              <SelectDropdown
                ariaLabel="Condição"
                value={condicao}
                onChange={(value) => alterarFiltro("condicao", value)}
                options={[{ value: "", label: "Todas" }, ...filtros.condicoes.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>
            <div>
              <span>Armazenamento</span>
              <SelectDropdown
                ariaLabel="Armazenamento"
                value={armazenamento}
                onChange={(value) => alterarFiltro("armazenamento", value)}
                options={[{ value: "", label: "Todos" }, ...filtros.armazenamentos.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>
            <div>
              <span>Cor</span>
              <SelectDropdown
                ariaLabel="Cor"
                value={cor}
                onChange={(value) => alterarFiltro("cor", value)}
                options={[{ value: "", label: "Todas as cores" }, ...filtros.cores.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>
            <div>
              <span>Estado</span>
              <SelectDropdown
                ariaLabel="Estado"
                value={estado}
                onChange={mudarEstado}
                options={[{ value: "", label: "Todo o Brasil" }, ...filtros.estados.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>
            <div>
              <span>Cidade</span>
              <SelectDropdown
                ariaLabel="Cidade"
                value={cidade}
                disabled={!estado}
                onChange={(value) => alterarFiltro("cidade", value)}
                options={[{ value: "", label: "Todas" }, ...cidadesDoEstado.map((item) => ({ value: item.valor, label: `${item.valor.replace(/,\s*[A-Z]{2}$/i, "")} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>
            <div>
              <span>Fornecedor</span>
              <SelectDropdown
                ariaLabel="Fornecedor"
                value={fornecedor}
                onChange={(value) => alterarFiltro("fornecedor", value)}
                options={[{ value: "", label: "Todos os fornecedores" }, ...fornecedoresDisponiveis.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>
          </div>
        </div>

        <div className="resultados-topo">
          <div>
            <h2 id="titulo-resultados">Resultados</h2>
            <span>{resultado.total.toLocaleString("pt-BR")} ofertas · ordenado por {ROTULOS_SORT[sort] ?? sort}</span>
          </div>
          <div className="sort-botoes" role="group" aria-label="Ordenar ofertas">
            <span>Ordenar</span>
            <button type="button" className={sort === "menor-preco" ? "ativo" : ""} onClick={() => alterarFiltro("sort", "menor-preco")}>Menor preço</button>
            <button type="button" className={sort === "recentes" ? "ativo" : ""} onClick={() => alterarFiltro("sort", "recentes")}>Mais recentes</button>
            <button type="button" className={sort === "maior-margem" ? "ativo" : ""} onClick={() => alterarFiltro("sort", "maior-margem")}>Maior margem</button>
          </div>
        </div>

        {carregando && <div className="estado-vazio">Buscando ofertas...</div>}
        {!carregando && resultado.items.length === 0 && (
          <div className="estado-vazio">Nenhuma oferta encontrada com esses filtros.</div>
        )}

        {!carregando && resultado.items.length > 0 && (
          <div className="tabela-ofertas">
            <div className="tabela-ofertas__scroll">
              <div className="tabela-ofertas__cabecalho">
                <span>Produto</span>
                <span>Fornecedor</span>
                <span>Local · atualizado</span>
                <span className="alinhar-direita">Custo</span>
                <span className="alinhar-direita">Venda sugerida</span>
                <span className="alinhar-direita">Margem</span>
                <span />
              </div>
              {resultado.items.map((oferta, indice) => {
                const chaveGrupo = `${oferta.modelo}__${extrairArmazenamento(oferta.modelo, oferta.variante)}`;
                const menorCusto = menorCustoPorGrupo.get(chaveGrupo) ?? oferta.valor_num;
                const diferenca = oferta.valor_num - menorCusto;
                const venda = Math.round(oferta.valor_num * (1 + markup / 100));
                const margem = venda - oferta.valor_num;
                const ehNovo = oferta.condicao.toLocaleLowerCase("pt-BR") === "novo";
                return (
                  <article className={`tabela-ofertas__linha ${indice % 2 ? "linha-alt" : ""}`} key={oferta.id}>
                    <div className="celula-produto">
                      <span className="swatch" style={{ background: corSwatch(oferta.cor) }} aria-hidden="true">
                        <span />
                      </span>
                      <span className="celula-produto__info">
                        <span className="celula-produto__nome">{oferta.modelo}</span>
                        <span className="celula-produto__tags">
                          <span className={`tag-condicao ${ehNovo ? "novo" : ""}`}>{oferta.condicao}</span>
                          {oferta.cor && <span className="tag-neutra">{oferta.cor}</span>}
                          {extrairArmazenamento(oferta.modelo, oferta.variante) && <span className="tag-neutra">{extrairArmazenamento(oferta.modelo, oferta.variante)}</span>}
                        </span>
                      </span>
                    </div>
                    <div className="celula-fornecedor">
                      <span className="celula-fornecedor__nome">{oferta.fornecedor || "—"}</span>
                      <span className={oferta.verificado ? "selo-verificado" : "selo-nao-verificado"}>
                        {oferta.verificado ? "✓ Verificado" : "Não verificado"}
                      </span>
                    </div>
                    <div className="celula-local">
                      <span>{oferta.cidade}</span>
                      <span className="celula-local__hora">{oferta.data_atualizacao}</span>
                    </div>
                    <div className="alinhar-direita celula-custo">{oferta.valor}</div>
                    <div className="alinhar-direita celula-venda">{formatarPreco(venda)}</div>
                    <div className="celula-margem">
                      <span>+{formatarPreco(margem)}</span>
                      <span className="celula-margem__nota">
                        {diferenca <= 0 ? "melhor preço do modelo" : `+${formatarPreco(diferenca)} vs. o menor`}
                      </span>
                    </div>
                    <div className="celula-acoes">
                      <button
                        type="button"
                        className="btn-whatsapp"
                        onClick={() => abrirWhatsApp(oferta)}
                        disabled={contatoCarregando === oferta.id}
                        aria-label={`Falar no WhatsApp sobre ${oferta.modelo}`}
                      >
                        <WhatsAppIcon className="ic" style={{ width: 15, height: 15 }} />
                        <span className="celula-acoes__rotulo">{contatoCarregando === oferta.id ? "Abrindo..." : "WhatsApp"}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="tabela-ofertas__rodape">
              <span>Mostrando {((page - 1) * itensPorPagina) + 1}–{Math.min(page * itensPorPagina, resultado.total)} de {resultado.total.toLocaleString("pt-BR")}</span>
              {totalPaginas > 1 && (
                <nav className="paginacao" aria-label="Paginação dos resultados">
                  <button type="button" aria-label="Página anterior" onClick={() => alterarFiltro("page", String(page - 1), { manterPagina: true })} disabled={page <= 1}>‹</button>
                  {paginasVisiveis(page, totalPaginas).map((pagina) => (
                    <button type="button" key={pagina} aria-current={pagina === page ? "page" : undefined} onClick={() => alterarFiltro("page", String(pagina), { manterPagina: true })}>{pagina}</button>
                  ))}
                  <button type="button" aria-label="Próxima página" onClick={() => alterarFiltro("page", String(page + 1), { manterPagina: true })} disabled={page >= totalPaginas}>›</button>
                </nav>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BuscadorPage() {
  return (
    <Suspense fallback={<div className="busca-shell"><div className="estado-vazio">Carregando catálogo...</div></div>}>
      <BuscadorConteudo />
    </Suspense>
  );
}
