"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FiltrosDisponiveis } from "@/lib/types";

type Aba = "alertas" | "notificacoes" | "preferencias";
type Alerta = {
  id: number;
  categoria: string | null;
  modeloBusca: string | null;
  condicaoDesejada: string | null;
  precoAlvo: number;
  canalEmail: boolean;
  canalTelegram: boolean;
  ativo: boolean;
  ultimoDisparoEm: string | null;
};
type Configuracoes = {
  usuario: { nome: string | null; email: string };
  preferencias: { visualizacaoPadrao: string; itensPorPagina: number; categoriaPadrao: string };
  alertas: Alerta[];
  telegram: { vinculado: boolean; username: string | null; vinculadoEm: string | null };
  canais: { email: boolean; telegram: boolean; botUsername: string | null };
  cache: { atualizadoEm: string; total: number; fresco: boolean } | null;
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("alertas");
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [filtros, setFiltros] = useState<FiltrosDisponiveis | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [formAlerta, setFormAlerta] = useState({
    categoria: "iphone", modeloBusca: "", condicaoDesejada: "", precoAlvo: "", canalEmail: true, canalTelegram: false,
  });

  const modelos = useMemo(() => filtros?.modelos.filter((item) => item.categoria === formAlerta.categoria) ?? [], [filtros, formAlerta.categoria]);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [configResponse, filtrosResponse] = await Promise.all([
        fetch("/api/buscador/configuracoes"),
        fetch("/api/buscador/filtros"),
      ]);
      if (configResponse.status === 401) return router.push("/buscador/login");
      if (!configResponse.ok) throw new Error("Não foi possível carregar as configurações.");
      setConfig(await configResponse.json());
      if (filtrosResponse.ok) setFiltros(await filtrosResponse.json());
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao carregar.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { void carregar(); }, []);

  async function criarAlerta(event: React.FormEvent) {
    event.preventDefault();
    setSalvando(true); setErro(""); setMensagem("");
    try {
      const response = await fetch("/api/buscador/configuracoes/alertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formAlerta, precoAlvo: Number(formAlerta.precoAlvo) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao criar alerta.");
      setFormAlerta((atual) => ({ ...atual, modeloBusca: "", precoAlvo: "" }));
      setMensagem("Alerta criado.");
      await carregar();
    } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao criar alerta."); }
    finally { setSalvando(false); }
  }

  async function alterarAlerta(alerta: Alerta, acao: "toggle" | "delete") {
    setErro(""); setMensagem("");
    const response = await fetch(`/api/buscador/configuracoes/alertas/${alerta.id}`, acao === "delete"
      ? { method: "DELETE" }
      : { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativo: !alerta.ativo }) });
    if (!response.ok) {
      const data = await response.json(); setErro(data.error || "Falha ao alterar alerta."); return;
    }
    setMensagem(acao === "delete" ? "Alerta removido." : alerta.ativo ? "Alerta pausado." : "Alerta reativado.");
    await carregar();
  }

  async function conectarTelegram() {
    setErro("");
    const response = await fetch("/api/buscador/configuracoes/telegram", { method: "POST" });
    const data = await response.json();
    if (!response.ok) return setErro(data.error || "Falha ao conectar Telegram.");
    window.open(data.url, "_blank", "noopener,noreferrer");
    setMensagem("Abra o bot e toque em Iniciar. O link expira em 15 minutos.");
  }

  async function desconectarTelegram() {
    await fetch("/api/buscador/configuracoes/telegram", { method: "DELETE" });
    setMensagem("Telegram desconectado.");
    await carregar();
  }

  async function salvarPreferencias(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config) return;
    setSalvando(true); setErro("");
    const response = await fetch("/api/buscador/configuracoes/preferencias", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config.preferencias),
    });
    const data = await response.json();
    if (!response.ok) setErro(data.error || "Falha ao salvar preferências.");
    else {
      window.localStorage.setItem("buscador-visualizacao", config.preferencias.visualizacaoPadrao);
      setMensagem("Preferências salvas.");
    }
    setSalvando(false);
  }

  return (
    <div className="busca-shell">
      <header className="busca-header">
        <span className="busca-marca"><span className="wordmark">MARIADAMAVI</span><span aria-hidden="true">·</span> Configurações</span>
        <Link className="config-link" href="/buscador">Voltar ao catálogo</Link>
      </header>
      <main className="config-body">
        <div className="config-intro">
          <div><p className="eyebrow">PAINEL INTERNO</p><h1>Configurações</h1></div>
          {config?.cache && <span className={`cache-status ${config.cache.fresco ? "ativo" : ""}`}>Cache: {config.cache.total.toLocaleString("pt-BR")} ofertas</span>}
        </div>
        <nav className="config-abas" aria-label="Seções de configurações">
          {(["alertas", "notificacoes", "preferencias"] as Aba[]).map((item) => (
            <button type="button" key={item} aria-current={aba === item ? "page" : undefined} onClick={() => setAba(item)}>
              {item === "alertas" ? "Alertas de preço" : item === "notificacoes" ? "Notificações" : "Preferências de busca"}
            </button>
          ))}
        </nav>
        {erro && <div className="catalogo-erro" role="alert">{erro}</div>}
        {mensagem && <div className="config-sucesso" role="status">{mensagem}</div>}
        {carregando && <div className="estado-vazio">Carregando configurações...</div>}

        {!carregando && config && aba === "alertas" && (
          <div className="config-grid">
            <section className="config-card">
              <h2>Novo alerta</h2>
              <p>Avise quando uma oferta aparecer dentro do valor definido.</p>
              <form className="config-form" onSubmit={criarAlerta}>
                <label>Categoria<select value={formAlerta.categoria} onChange={(e) => setFormAlerta({ ...formAlerta, categoria: e.target.value, modeloBusca: "" })}>
                  {(filtros?.categorias ?? []).map((item) => <option key={item.valor} value={item.valor}>{item.valor}</option>)}
                  {!filtros && <option value="iphone">iphone</option>}
                </select></label>
                <label>Modelo<select value={formAlerta.modeloBusca} onChange={(e) => setFormAlerta({ ...formAlerta, modeloBusca: e.target.value })}>
                  <option value="">Qualquer modelo da categoria</option>
                  {modelos.map((item) => <option key={item.valor} value={item.valor}>{item.valor}</option>)}
                </select></label>
                <label>Condição<select value={formAlerta.condicaoDesejada} onChange={(e) => setFormAlerta({ ...formAlerta, condicaoDesejada: e.target.value })}>
                  <option value="">Novo ou usado</option><option value="Novo">Novo</option><option value="Usado">Usado</option>
                </select></label>
                <label>Preço-alvo (R$)<input required min="1" step="0.01" type="number" value={formAlerta.precoAlvo} onChange={(e) => setFormAlerta({ ...formAlerta, precoAlvo: e.target.value })} /></label>
                <fieldset><legend>Canais</legend>
                  <label className="check"><input type="checkbox" checked={formAlerta.canalEmail} disabled={!config.canais.email} onChange={(e) => setFormAlerta({ ...formAlerta, canalEmail: e.target.checked })} /> E-mail {!config.canais.email && "(aguardando credenciais)"}</label>
                  <label className="check"><input type="checkbox" checked={formAlerta.canalTelegram} disabled={!config.canais.telegram || !config.telegram.vinculado} onChange={(e) => setFormAlerta({ ...formAlerta, canalTelegram: e.target.checked })} /> Telegram {!config.canais.telegram ? "(aguardando credenciais)" : !config.telegram.vinculado ? "(não vinculado)" : ""}</label>
                </fieldset>
                <button className="config-primary" disabled={salvando || (!formAlerta.canalEmail && !formAlerta.canalTelegram)}>{salvando ? "Salvando..." : "Criar alerta"}</button>
              </form>
            </section>
            <section className="config-card config-card--lista"><h2>Seus alertas</h2>
              {config.alertas.length === 0 && <p>Nenhum alerta criado.</p>}
              {config.alertas.map((alerta) => <article className="alerta-item" key={alerta.id}>
                <div><strong>{alerta.modeloBusca || alerta.categoria}</strong><span>{alerta.condicaoDesejada || "Novo ou usado"} · até R$ {alerta.precoAlvo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span><small>{[alerta.canalEmail && "E-mail", alerta.canalTelegram && "Telegram"].filter(Boolean).join(" + ")}</small></div>
                <span className={`alerta-estado ${alerta.ativo ? "ativo" : ""}`}>{alerta.ativo ? "Ativo" : "Pausado"}</span>
                <div className="alerta-acoes"><button type="button" onClick={() => alterarAlerta(alerta, "toggle")}>{alerta.ativo ? "Pausar" : "Reativar"}</button><button type="button" onClick={() => alterarAlerta(alerta, "delete")}>Excluir</button></div>
              </article>)}
            </section>
          </div>
        )}

        {!carregando && config && aba === "notificacoes" && <div className="config-grid">
          <section className="config-card"><h2>E-mail</h2><p>Os alertas são enviados para <strong>{config.usuario.email}</strong>.</p><span className={`canal-status ${config.canais.email ? "ativo" : ""}`}>{config.canais.email ? "Configurado" : "Aguardando RESEND_API_KEY e ALERT_EMAIL_FROM"}</span></section>
          <section className="config-card"><h2>Telegram</h2><p>{config.telegram.vinculado ? `Conectado${config.telegram.username ? ` como @${config.telegram.username}` : ""}.` : "Conecte sua conta abrindo o bot e tocando em Iniciar."}</p><span className={`canal-status ${config.canais.telegram ? "ativo" : ""}`}>{config.canais.telegram ? "Bot configurado" : "Aguardando credenciais do bot"}</span><div className="config-card__acoes">{config.telegram.vinculado ? <button type="button" onClick={desconectarTelegram}>Desconectar</button> : <button type="button" className="config-primary" disabled={!config.canais.telegram} onClick={conectarTelegram}>Conectar Telegram</button>}</div></section>
        </div>}

        {!carregando && config && aba === "preferencias" && <section className="config-card config-card--preferencias"><h2>Ao abrir o catálogo</h2><form className="config-form" onSubmit={salvarPreferencias}>
          <label>Visualização<select value={config.preferencias.visualizacaoPadrao} onChange={(e) => setConfig({ ...config, preferencias: { ...config.preferencias, visualizacaoPadrao: e.target.value } })}><option value="lista">Lista</option><option value="grade">Grade</option></select></label>
          <label>Itens por página<select value={config.preferencias.itensPorPagina} onChange={(e) => setConfig({ ...config, preferencias: { ...config.preferencias, itensPorPagina: Number(e.target.value) } })}>{[10,25,50,100].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label>Categoria padrão<select value={config.preferencias.categoriaPadrao} onChange={(e) => setConfig({ ...config, preferencias: { ...config.preferencias, categoriaPadrao: e.target.value } })}>{(filtros?.categorias ?? [{ valor: "iphone", total: 0 }]).map((item) => <option key={item.valor} value={item.valor}>{item.valor}</option>)}</select></label>
          <button className="config-primary" disabled={salvando}>{salvando ? "Salvando..." : "Salvar preferências"}</button>
        </form></section>}
      </main>
    </div>
  );
}
