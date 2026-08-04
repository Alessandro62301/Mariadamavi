"use client";

import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import type {Oferta, OfertasResponse, Status} from "@/lib/types";
import {WhatsAppIcon} from "@/components/icons";

const CATEGORIAS = ["iphone", "ipad", "macbook", "apple watch"];
const CONDICOES = ["Usado", "Novo"];
const CIDADES = ["São Paulo, SP", "Campo Grande, MS", "Guarulhos, SP"];

export default function BuscadorPage() {
    const router = useRouter();

    const [status, setStatus] = useState<Status | null>(null);
    const [categoria, setCategoria] = useState("");
    const [condicao, setCondicao] = useState("");
    const [cidade, setCidade] = useState("");
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("recentes");
    const [page, setPage] = useState(1);

    const [resultado, setResultado] = useState<OfertasResponse | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [contatoCarregando, setContatoCarregando] = useState<number | null>(null);

    useEffect(() => {
        fetch("/api/buscador/status")
            .then((r) => r.json())
            .then(setStatus)
            .catch(() => {
            });
    }, []);

    const buscar = useCallback(async () => {
        setCarregando(true);
        const params = new URLSearchParams();
        if (categoria) params.set("categoria", categoria);
        if (condicao) params.set("condicao", condicao);
        if (cidade) params.set("cidade", cidade);
        if (q) params.set("q", q);
        params.set("sort", sort);
        params.set("page", String(page));
        params.set("pageSize", "25");

        try {
            const res = await fetch(`/api/buscador/ofertas?${params.toString()}`);
            if (res.status === 401) {
                router.push("/buscador/login");
                return;
            }
            const data = await res.json();
            setResultado(data);
        } finally {
            setCarregando(false);
        }
    }, [categoria, condicao, cidade, q, sort, page, router]);

    useEffect(() => {
        buscar();
    }, [buscar]);

    useEffect(() => {
        setPage(1);
    }, [categoria, condicao, cidade, q, sort]);

    async function abrirWhatsApp(oferta: Oferta) {
        setContatoCarregando(oferta.id);
        try {
            const res = await fetch(`/api/buscador/ofertas/${oferta.id}/contato`);
            if (!res.ok) return;
            const contato = await res.json();
            const msg = encodeURIComponent(
                `Oi! Vi o ${oferta.modelo} (${oferta.cor}, ${oferta.condicao}) por ${oferta.valor}.`
            );
            window.open(`${contato.whatsapp_url}?text=${msg}`, "_blank");
        } finally {
            setContatoCarregando(null);
        }
    }

    async function sair() {
        await fetch("/api/auth/logout", {method: "POST"});
        router.push("/buscador/login");
    }

    const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / resultado.pageSize)) : 1;

    return (
        <div className="busca-shell">
            <div className="busca-header">
                <span className="wordmark">MARIADAMAVI · Buscador</span>
                {status && (
                    <div className="stats">
                        <span><b>{status.total.toLocaleString("pt-BR")}</b> ofertas</span>
                        <span><b>{status.fornecedores}</b> fornecedores</span>
                        <span><b>{status.cidades}</b> cidades</span>
                    </div>
                )}
                <button className="logout" onClick={sair}>Sair</button>
            </div>

            <div className="busca-body">
                <div className="filtros">
                    <input
                        className="busca-texto"
                        placeholder="Buscar por modelo (ex: iPhone 13)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option value="">Todas as categorias</option>
                        {CATEGORIAS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select value={condicao} onChange={(e) => setCondicao(e.target.value)}>
                        <option value="">Novo e usado</option>
                        {CONDICOES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select value={cidade} onChange={(e) => setCidade(e.target.value)}>
                        <option value="">Todas as cidades</option>
                        {CIDADES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="recentes">Mais recentes</option>
                        <option value="menor-preco">Menor preço</option>
                        <option value="maior-preco">Maior preço</option>
                    </select>
                </div>

                <div className="resultados-topo">
                    <h2>Resultados</h2>
                    {resultado && <span>{resultado.total.toLocaleString("pt-BR")} ofertas encontradas</span>}
                </div>

                {carregando && <div className="estado-vazio">Buscando...</div>}

                {!carregando && resultado && resultado.items.length === 0 && (
                    <div className="estado-vazio">Nenhuma oferta encontrada com esses filtros.</div>
                )}

                {!carregando && resultado && resultado.items.length > 0 && (
                    <div className="oferta-lista">
                        {resultado.items.map((oferta) => (
                            <div className="oferta-row" key={oferta.id}>
                                <div className="oferta-info">
                                    <h3>{oferta.modelo}</h3>
                                    <div className="oferta-tags">
                                        <span
                                            className={`tag ${oferta.condicao === "Usado" ? "usado" : "novo"}`}>{oferta.condicao}</span>
                                        <span className="tag">{oferta.cor}</span>
                                        {oferta.verificado && <span className="tag verificado">Verificado</span>}
                                        <span
                                            className="oferta-local">{oferta.cidade} · {oferta.data_atualizacao}</span>
                                    </div>
                                </div>
                                <div className="oferta-preco">{oferta.valor}</div>
                                <div className="oferta-actions">
                                    <button
                                        className="btn-whatsapp"
                                        onClick={() => abrirWhatsApp(oferta)}
                                        disabled={contatoCarregando === oferta.id}
                                    >
                                        <WhatsAppIcon className="ic" style={{width: 16, height: 16}}/>
                                        {contatoCarregando === oferta.id ? "Abrindo..." : "WhatsApp"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {resultado && totalPaginas > 1 && (
                    <div className="paginacao">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>‹</button>
                        {Array.from({length: Math.min(totalPaginas, 7)}, (_, i) => i + 1).map((p) => (
                            <button key={p} aria-current={p === page} onClick={() => setPage(p)}>{p}</button>
                        ))}
                        <button onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                                disabled={page >= totalPaginas}>›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
