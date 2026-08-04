"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FiltrosDisponiveis, Oferta, OfertasResponse } from "@/lib/types";
import { GridIcon, ListIcon, WhatsAppIcon } from "@/components/icons";
import Link from "next/link";
import { SelectDropdown } from "@/components/select-dropdown";

type Visualizacao = "lista" | "grade";

const QUANTIDADES_POR_PAGINA = [10, 25, 50, 100];
const LIMITE_MODELOS = 7;
const CATEGORIAS = ["iphone", "ipad", "macbook", "watch", "acessorios", "eletronicos"];
const ROTULOS_CATEGORIA: Record<string, string> = {
  iphone: "iPhone",
  ipad: "iPad",
  macbook: "MacBook",
  watch: "Apple Watch",
  acessorios: "Acessórios",
  eletronicos: "Eletrônicos",
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

function RotuloComTotal({ valor, total }: { valor: string; total: number }) {
  return <>{valor} — {total.toLocaleString("pt-BR")}</>;
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
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "menor-preco";
  const page = numeroPositivo(searchParams.get("page"), 1);
  const itensPorPagina = numeroPositivo(searchParams.get("itensPorPagina"), 25);

  const [todasOfertas, setTodasOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [contatoCarregando, setContatoCarregando] = useState<number | null>(null);
  const [modelosExpandidos, setModelosExpandidos] = useState(false);
  const [visualizacao, setVisualizacao] = useState<Visualizacao>("lista");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState(q);

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

    Promise.all([
      fetch("/api/buscador/ofertas", { signal: controller.signal }),
      fetch("/api/buscador/configuracoes", { signal: controller.signal }),
    ])
      .then(async ([ofertasResponse, configuracoesResponse]) => {
        if (ofertasResponse.status === 401 || configuracoesResponse.status === 401) {
          router.push("/buscador/login");
          return;
        }
        if (!ofertasResponse.ok || !configuracoesResponse.ok) throw new Error("Falha ao carregar o catálogo.");
        const [catalogo, configuracoes] = await Promise.all([
          ofertasResponse.json() as Promise<OfertasResponse>,
          configuracoesResponse.json(),
        ]);
        setTodasOfertas(catalogo.items);
        const paramsAtuais = new URLSearchParams(window.location.search);
        if (!paramsAtuais.has("categoria")) {
          const params = new URLSearchParams(paramsAtuais);
          params.set("categoria", configuracoes.preferencias.categoriaPadrao);
          params.set("itensPorPagina", String(configuracoes.preferencias.itensPorPagina));
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
        if (!window.localStorage.getItem("buscador-visualizacao")) {
          setVisualizacao(configuracoes.preferencias.visualizacaoPadrao);
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErro("Não foi possível carregar o catálogo.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [pathname, router]);

  useEffect(() => {
    const preferencia = window.localStorage.getItem("buscador-visualizacao");
    if (preferencia === "lista" || preferencia === "grade") setVisualizacao(preferencia);
  }, []);

  useEffect(() => {
    if (!filtrosAbertos) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflowAnterior; };
  }, [filtrosAbertos]);

  const status = useMemo(() => ({
    total: todasOfertas.length,
    fornecedores: new Set(todasOfertas.map((oferta) => oferta.fornecedor?.trim()).filter(Boolean)).size,
    cidades: new Set(todasOfertas.map((oferta) => oferta.cidade.trim()).filter(Boolean)).size,
  }), [todasOfertas]);

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

  const resultado = useMemo<OfertasResponse>(() => {
    const termoBusca = buscaTexto.trim().toLocaleLowerCase("pt-BR");
    let items = todasOfertas.filter((oferta) => {
      if (!termoBusca && categoria && oferta.categoria !== categoria) return false;
      if (modelo && extrairModeloBase(oferta.modelo) !== modelo) return false;
      if (condicao && oferta.condicao !== condicao) return false;
      if (cor && oferta.cor !== cor) return false;
      if (armazenamento && extrairArmazenamento(oferta.modelo, oferta.variante) !== armazenamento) return false;
      if (estado && extrairEstado(oferta.cidade) !== estado) return false;
      if (cidade && oferta.cidade !== cidade) return false;
      if (termoBusca && !oferta.modelo.toLocaleLowerCase("pt-BR").includes(termoBusca)) return false;
      return true;
    });
    items = [...items].sort((a, b) => {
      if (sort === "menor-preco") return a.valor_num - b.valor_num;
      if (sort === "maior-preco") return b.valor_num - a.valor_num;
      if (sort === "a-z") return a.modelo.localeCompare(b.modelo, "pt-BR", { numeric: true });
      return b.id - a.id;
    });
    const total = items.length;
    const inicio = (page - 1) * itensPorPagina;
    return { items: items.slice(inicio, inicio + itensPorPagina), total, page, pageSize: itensPorPagina };
  }, [armazenamento, buscaTexto, categoria, cidade, condicao, cor, estado, itensPorPagina, modelo, page, sort, todasOfertas]);

  const modelosDaCategoria = useMemo(() => {
    if (!categoria) return [];
    return filtros.modelos.filter((item) => item.categoria === categoria);
  }, [categoria, filtros.modelos]);

  const cidadesDoEstado = useMemo(() => {
    return filtros.cidades.filter((item) => !estado || item.estado === estado);
  }, [estado, filtros.cidades]);

  const modelosVisiveis = modelosExpandidos ? modelosDaCategoria : modelosDaCategoria.slice(0, LIMITE_MODELOS);
  const totalPaginas = Math.max(1, Math.ceil(resultado.total / resultado.pageSize));
  const totalFiltrosAtivos = [categoria, modelo, condicao, cor, armazenamento, estado, cidade].filter(Boolean).length;

  function mudarCategoria(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set("categoria", valor);
    else params.set("categoria", "");
    params.delete("modelo");
    params.delete("page");
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    setModelosExpandidos(false);
  }

  function mudarEstado(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set("estado", valor);
    else params.delete("estado");
    params.delete("cidade");
    params.delete("page");
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  function limparFiltros() {
    router.replace(`${pathname}?categoria=iphone`, { scroll: false });
    setModelosExpandidos(false);
  }

  function mudarVisualizacao(novaVisualizacao: Visualizacao) {
    setVisualizacao(novaVisualizacao);
    window.localStorage.setItem("buscador-visualizacao", novaVisualizacao);
  }

  function confirmarBusca() {
    if (buscaTexto === q) return;
    alterarFiltro("q", buscaTexto.trim());
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
        <span className="busca-marca"><span className="wordmark">MARIADAMAVI</span><span aria-hidden="true">·</span> Catálogo</span>
        {!carregando && (
          <div className="stats" aria-label="Resumo do catálogo">
            <span><b>{status.total.toLocaleString("pt-BR")}</b> ofertas</span>
            <span><b>{status.fornecedores.toLocaleString("pt-BR")}</b> fornecedores</span>
            <span><b>{status.cidades.toLocaleString("pt-BR")}</b> cidades</span>
          </div>
        )}
        <div className="busca-header__acoes">
          <Link className="config-link" href="/buscador/configuracoes">Configurações</Link>
          <button type="button" className="logout" onClick={sair}>Sair</button>
        </div>
      </header>

      <main className="busca-body">
        <div className="catalogo-layout">
          <button className={`filtro-overlay ${filtrosAbertos ? "aberto" : ""}`} type="button" aria-label="Fechar filtros" onClick={() => setFiltrosAbertos(false)} />
          <aside className={`painel-filtros ${filtrosAbertos ? "aberto" : ""}`} aria-label="Filtros do catálogo">
            <div className="painel-filtros__topo">
              <h2>Filtros</h2>
              <div className="painel-filtros__acoes">
                <button type="button" onClick={limparFiltros}>Limpar</button>
                <button className="fechar-filtros" type="button" aria-label="Fechar filtros" onClick={() => setFiltrosAbertos(false)}>×</button>
              </div>
            </div>

            {carregando && <p className="filtros-loading">Carregando opções...</p>}

            <div className="grupo-filtro">
              <span className="grupo-filtro__rotulo">Categoria</span>
              <div className="categorias-checklist">
                {filtros.categorias.map((item) => (
                  <label className={categoria === item.valor ? "ativo" : ""} key={item.valor}>
                    <input
                      type="checkbox"
                      checked={categoria === item.valor}
                      onChange={() => mudarCategoria(categoria === item.valor ? "" : item.valor)}
                    />
                    <span className="categoria-check" aria-hidden="true" />
                    <span className="categoria-nome">{ROTULOS_CATEGORIA[item.valor] ?? item.valor}</span>
                    <span className="categoria-total">{item.total.toLocaleString("pt-BR")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grupo-filtro">
              <span className="grupo-filtro__rotulo">Modelo</span>
              {!categoria && <p className="grupo-filtro__ajuda">Selecione uma categoria para ver os modelos.</p>}
              {categoria && modelosDaCategoria.length === 0 && !carregando && (
                <p className="grupo-filtro__ajuda">Nenhum modelo disponível nesta categoria.</p>
              )}
              {modelosVisiveis.length > 0 && (
                <div className="opcoes-modelo">
                  <button type="button" className={!modelo ? "ativo" : ""} onClick={() => alterarFiltro("modelo", "")}>Todos</button>
                  {modelosVisiveis.map((item) => (
                    <button
                      type="button"
                      className={modelo === item.valor ? "ativo" : ""}
                      key={`${item.categoria}-${item.valor}`}
                      onClick={() => alterarFiltro("modelo", modelo === item.valor ? "" : item.valor)}
                    >
                      <RotuloComTotal valor={item.valor} total={item.total} />
                    </button>
                  ))}
                </div>
              )}
              {modelosDaCategoria.length > LIMITE_MODELOS && (
                <button type="button" className="ver-mais" onClick={() => setModelosExpandidos((valor) => !valor)}>
                  {modelosExpandidos ? "Ver menos" : `Ver mais (${modelosDaCategoria.length - LIMITE_MODELOS})`}
                </button>
              )}
            </div>

            <div className="grupo-filtro">
              <span className="grupo-filtro__rotulo">Condição</span>
              <SelectDropdown
                ariaLabel="Condição"
                value={condicao}
                onChange={(value) => alterarFiltro("condicao", value)}
                options={[{ value: "", label: "Todos" }, ...filtros.condicoes.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>

            <div className="grupo-filtro grupo-filtro--duplo">
              <div>
                <span className="grupo-filtro__rotulo">Estado</span>
                <SelectDropdown
                  ariaLabel="Estado"
                  value={estado}
                  onChange={mudarEstado}
                  options={[{ value: "", label: "Todos" }, ...filtros.estados.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
                />
              </div>
              <div>
                <span className="grupo-filtro__rotulo">Cidade</span>
                <SelectDropdown
                  ariaLabel="Cidade"
                  value={cidade}
                  disabled={!estado}
                  onChange={(value) => alterarFiltro("cidade", value)}
                  options={[{ value: "", label: "Todas" }, ...cidadesDoEstado.map((item) => ({ value: item.valor, label: `${item.valor.replace(/,\s*[A-Z]{2}$/i, "")} — ${item.total.toLocaleString("pt-BR")}` }))]}
                />
              </div>
            </div>

            <div className="grupo-filtro">
              <span className="grupo-filtro__rotulo">Cor</span>
              <SelectDropdown
                ariaLabel="Cor"
                value={cor}
                onChange={(value) => alterarFiltro("cor", value)}
                options={[{ value: "", label: "Todas as cores" }, ...filtros.cores.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>

            <div className="grupo-filtro">
              <span className="grupo-filtro__rotulo">Armazenamento</span>
              <SelectDropdown
                ariaLabel="Armazenamento"
                value={armazenamento}
                onChange={(value) => alterarFiltro("armazenamento", value)}
                options={[{ value: "", label: "Todos" }, ...filtros.armazenamentos.map((item) => ({ value: item.valor, label: `${item.valor} — ${item.total.toLocaleString("pt-BR")}` }))]}
              />
            </div>
            <div className="painel-filtros__rodape">
              <button type="button" onClick={() => setFiltrosAbertos(false)}>Ver {resultado.total.toLocaleString("pt-BR")} produtos</button>
            </div>
          </aside>

          <section className="catalogo-resultados" aria-labelledby="titulo-resultados">
            <div className="barra-catalogo filtros">
              <button
                className="abrir-filtros"
                type="button"
                aria-expanded={filtrosAbertos}
                onClick={() => setFiltrosAbertos(true)}
              >
                <span aria-hidden="true">☰</span> Filtros
                {totalFiltrosAtivos > 0 && <b>{totalFiltrosAtivos}</b>}
              </button>
              <input
                className="busca-texto"
                type="search"
                aria-label="Buscar por modelo"
                placeholder="Buscar por modelo (ex.: iPhone 13)"
                value={buscaTexto}
                onChange={(event) => {
                  setBuscaTexto(event.target.value);
                  if (!event.target.value) alterarFiltro("q", "");
                }}
                onBlur={confirmarBusca}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    confirmarBusca();
                  }
                }}
              />
              <SelectDropdown
                className="select-ordenacao"
                ariaLabel="Ordenar ofertas"
                value={sort}
                onChange={(value) => alterarFiltro("sort", value)}
                options={[
                  { value: "menor-preco", label: "Menor preço" },
                  { value: "maior-preco", label: "Maior preço" },
                  { value: "recentes", label: "Mais recentes" },
                  { value: "a-z", label: "Modelo: A → Z" },
                ]}
              />
              <SelectDropdown
                className="select-paginacao"
                ariaLabel="Itens por página"
                value={String(itensPorPagina)}
                onChange={(value) => alterarFiltro("itensPorPagina", value)}
                options={QUANTIDADES_POR_PAGINA.map((quantidade) => ({ value: String(quantidade), label: `${quantidade} por página` }))}
              />
            </div>

            <div className="resultados-topo">
              <div>
                <h2 id="titulo-resultados">Resultados</h2>
                {resultado && <span>{resultado.total.toLocaleString("pt-BR")} produtos encontrados</span>}
              </div>
              <div className="visualizacao-toggle" aria-label="Modo de visualização">
                <button type="button" aria-label="Visualizar em lista" aria-pressed={visualizacao === "lista"} onClick={() => mudarVisualizacao("lista")}>
                  <ListIcon className="ic" />
                </button>
                <button type="button" aria-label="Visualizar em grade" aria-pressed={visualizacao === "grade"} onClick={() => mudarVisualizacao("grade")}>
                  <GridIcon className="ic" />
                </button>
              </div>
            </div>

            {erro && <div className="catalogo-erro" role="alert">{erro}</div>}
            {carregando && <div className="estado-vazio">Buscando ofertas...</div>}

            {!carregando && resultado && resultado.items.length === 0 && (
              <div className="estado-vazio">Nenhuma oferta encontrada com esses filtros.</div>
            )}

            {!carregando && resultado && resultado.items.length > 0 && (
              <div className={`oferta-lista oferta-lista--${visualizacao}`}>
                {resultado.items.map((oferta) => (
                  <article className="oferta-row" key={oferta.id}>
                    <div className="oferta-foto-wrap">
                      <span aria-hidden="true">Sem foto</span>
                      {oferta.foto_url && (
                        <img
                          className="oferta-foto"
                          src={oferta.foto_url}
                          alt={`Foto de ${oferta.modelo}`}
                          loading="lazy"
                          onError={(event) => { event.currentTarget.hidden = true; }}
                        />
                      )}
                    </div>
                    <div className="oferta-info">
                      <h3>{oferta.modelo}</h3>
                      <div className="oferta-tags">
                        <span className={`tag ${oferta.condicao.toLocaleLowerCase("pt-BR") === "usado" ? "usado" : "novo"}`}>{oferta.condicao}</span>
                        {oferta.cor && <span className="tag">{oferta.cor}</span>}
                        {oferta.verificado && <span className="tag verificado">Verificado</span>}
                      </div>
                      {oferta.fornecedor && <span className="oferta-loja">{oferta.fornecedor}</span>}
                      <span className="oferta-local">{oferta.cidade} · {oferta.data_atualizacao}</span>
                    </div>
                    <div className="oferta-preco">{oferta.valor}</div>
                    <div className="oferta-actions">
                      <button
                        type="button"
                        className="btn-whatsapp"
                        onClick={() => abrirWhatsApp(oferta)}
                        disabled={contatoCarregando === oferta.id}
                      >
                        <WhatsAppIcon className="ic" style={{ width: 16, height: 16 }} />
                        {contatoCarregando === oferta.id ? "Abrindo..." : "WhatsApp"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {resultado && totalPaginas > 1 && (
              <nav className="paginacao" aria-label="Paginação dos resultados">
                <button type="button" aria-label="Página anterior" onClick={() => alterarFiltro("page", String(page - 1), { manterPagina: true })} disabled={page <= 1}>‹</button>
                {paginasVisiveis(page, totalPaginas).map((pagina) => (
                  <button type="button" key={pagina} aria-current={pagina === page ? "page" : undefined} onClick={() => alterarFiltro("page", String(pagina), { manterPagina: true })}>{pagina}</button>
                ))}
                <button type="button" aria-label="Próxima página" onClick={() => alterarFiltro("page", String(page + 1), { manterPagina: true })} disabled={page >= totalPaginas}>›</button>
              </nav>
            )}
          </section>
        </div>
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
