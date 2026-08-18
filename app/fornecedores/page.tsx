"use client";

import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FORNECEDORES, type Fornecedor } from "@/lib/fornecedores";

const FornecedoresMapa = dynamic(() => import("@/components/FornecedoresMapa").then((mod) => mod.FornecedoresMapa), {
  ssr: false,
  loading: () => <div className="mapa-carregando">Carregando mapa...</div>,
});

const FILTROS = [
  { key: "todos", label: "Todos" },
  { key: "verificados", label: "Só verificados" },
  { key: "SP", label: "São Paulo" },
  { key: "RJ", label: "Rio" },
  { key: "outros", label: "Outros estados" },
];

type Voo = { nome: string; lat: number; lng: number; zoom: number };

export default function FornecedoresPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [voo, setVoo] = useState<Voo | null>(null);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return FORNECEDORES.filter((fornecedor) => {
      if (filtro === "verificados" && !fornecedor.verificado) return false;
      if (filtro === "SP" && fornecedor.uf !== "SP") return false;
      if (filtro === "RJ" && fornecedor.uf !== "RJ") return false;
      if (filtro === "outros" && (fornecedor.uf === "SP" || fornecedor.uf === "RJ")) return false;
      if (termo && !`${fornecedor.nome} ${fornecedor.cidade} ${fornecedor.galeria}`.toLocaleLowerCase("pt-BR").includes(termo)) return false;
      return true;
    }).sort((a, b) => b.ofertas - a.ofertas);
  }, [busca, filtro]);

  const kpis = useMemo(() => ({
    fornecedores: visiveis.length,
    ofertas: visiveis.reduce((soma, item) => soma + item.ofertas, 0),
    verificados: visiveis.filter((item) => item.verificado).length,
    cidades: new Set(visiveis.map((item) => item.cidade)).size,
  }), [visiveis]);

  function selecionarCard(fornecedor: Fornecedor) {
    setSelecionado(fornecedor.nome);
    setVoo({
      nome: fornecedor.nome,
      lat: fornecedor.lat,
      lng: fornecedor.lng,
      zoom: fornecedor.uf === "SP" || fornecedor.uf === "RJ" ? 15 : 13,
    });
  }

  function resetar() {
    setSelecionado(null);
    setFiltro("todos");
    setBusca("");
    setVoo({ nome: "__brasil__", lat: -15.3, lng: -51.9, zoom: 4 });
  }

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/buscador/login");
  }

  return (
    <div className="fornecedores-shell">
      <header className="busca-header">
        <span className="wordmark busca-header__marca">MARIADAMAVI</span>
        <nav className="busca-header__tabs" aria-label="Navegação do app">
          <Link className="busca-header__tab" href="/buscador">Produtos</Link>
          <span className="busca-header__tab busca-header__tab--ativa">Fornecedores</span>
          <span className="busca-header__tab busca-header__tab--desativada">Preços do dia</span>
          <span className="busca-header__tab busca-header__tab--desativada">Minhas listas</span>
        </nav>
        <div className="busca-header__stats">
          <span><b>{FORNECEDORES.length}</b> fornecedores</span>
          <span><b>{new Set(FORNECEDORES.map((item) => item.cidade)).size}</b> cidades</span>
        </div>
        <div className="busca-header__spacer" />
        <Link className="config-link" href="/buscador/configuracoes">Configurações</Link>
        <button type="button" className="logout" onClick={sair}>Sair</button>
        <div className="busca-header__conta">
          <span className="busca-header__avatar" aria-hidden="true">M</span>
          <span className="busca-header__nome">Maria</span>
        </div>
      </header>

      <div className="fornecedores-corpo">
        <aside className="fornecedores-painel">
          <div className="fornecedores-painel__topo">
            <div>
              <h1>Fornecedores no mapa</h1>
              <p>Clique num cartão para centralizar. No mapa afastado, as cidades aparecem agrupadas — dê zoom ou clique na bolha para abrir os fornecedores.</p>
            </div>
            <div className="fornecedores-busca">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" /></svg>
              <input
                type="text"
                placeholder="Buscar fornecedor, cidade ou galeria…"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>
            <div className="fornecedores-chips">
              {FILTROS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={filtro === item.key ? "on" : ""}
                  onClick={() => setFiltro(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fornecedores-lista">
            {visiveis.map((fornecedor) => (
              <button
                key={fornecedor.nome}
                type="button"
                className={`fornecedor-card ${selecionado === fornecedor.nome ? "on" : ""}`}
                onClick={() => selecionarCard(fornecedor)}
              >
                <span className="fornecedor-card__topo">
                  <span className="fornecedor-card__nome">{fornecedor.nome}</span>
                  <span className="fornecedor-card__ofertas">{fornecedor.ofertas} ofertas</span>
                </span>
                <span className="fornecedor-card__meta">{fornecedor.galeria} · {fornecedor.cidade}</span>
                <span className="fornecedor-card__tags">
                  {fornecedor.verificado
                    ? <span className="tag-mini verificado">✓ Verificado</span>
                    : <span className="tag-mini">Não verificado</span>}
                  <span className="tag-mini">★ {fornecedor.nota.toFixed(1)}</span>
                  {fornecedor.melhor && <span className="tag-mini novo">Melhor preço hoje</span>}
                </span>
              </button>
            ))}
            {visiveis.length === 0 && <p className="fornecedores-vazio">Nenhum fornecedor encontrado com esses filtros.</p>}
          </div>

          <div className="fornecedores-painel__rodape">
            <span>{visiveis.length} de {FORNECEDORES.length} fornecedores</span>
            <button type="button" onClick={resetar}>Ver o Brasil inteiro</button>
          </div>
        </aside>

        <div className="fornecedores-mapa-wrap">
          <FornecedoresMapa fornecedores={visiveis} selecionado={selecionado} onSelecionar={setSelecionado} vooPara={voo} />
          <div className="mapa-kpis">
            <div className="mapa-kpi"><span>Fornecedores</span><b>{kpis.fornecedores}</b></div>
            <div className="mapa-kpi"><span>Ofertas ativas</span><b>{kpis.ofertas.toLocaleString("pt-BR")}</b></div>
            <div className="mapa-kpi"><span>Verificados</span><b>{kpis.verificados}</b></div>
          </div>
          <div className="mapa-legenda">
            <b>Legenda</b>
            <div><span className="dot" style={{ background: "var(--plum)" }} /> Verificado por mim</div>
            <div><span className="dot" style={{ background: "var(--rose)" }} /> Ainda não verificado</div>
            <div><span className="dot" style={{ background: "var(--pink)" }} /> Selecionado</div>
          </div>
        </div>
      </div>
    </div>
  );
}
