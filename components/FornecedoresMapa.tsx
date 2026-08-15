"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { Fornecedor } from "@/lib/fornecedores";

const ZOOM_AGRUPADO = 8;
const CENTRO_BRASIL: [number, number] = [-15.3, -51.9];

function whatsappUrl(fornecedor: Fornecedor) {
  return `https://wa.me/${fornecedor.tel}?text=${encodeURIComponent(
    "Oi! Sou a Maria da Mavi. Queria consultar disponibilidade e preço.",
  )}`;
}

function popupFornecedor(fornecedor: Fornecedor) {
  return `<div class="pop-name">${fornecedor.nome}</div>
    <div class="pop-meta">${fornecedor.galeria} · ${fornecedor.cidade}<br>${fornecedor.ofertas} ofertas ativas · nota ${fornecedor.nota.toFixed(1)}${fornecedor.verificado ? " · ✓ verificado" : ""}</div>
    <a class="pop-wa" href="${whatsappUrl(fornecedor)}" target="_blank" rel="noopener noreferrer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm5.6 14.2c-.2.6-1.3 1.2-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5.2.6.7 1.9.8 2 .1.2.1.4 0 .6-.1.2-.1.3-.3.5-.1.2-.3.4-.4.5-.1.1-.3.3-.1.6.2.3.9 1.5 2 2.4 1.3 1.2 2.4 1.5 2.7 1.7.3.2.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.3.1.2.1.7-.1 1.3z"/></svg>
      Falar no WhatsApp
    </a>`;
}

function popupCidade(cidade: string, itens: Fornecedor[]) {
  const total = itens.reduce((soma, item) => soma + item.ofertas, 0);
  return `<div class="pop-name">${cidade}</div>
    <div class="pop-meta">${itens.length} fornecedores · ${total.toLocaleString("pt-BR")} ofertas ativas</div>
    <span style="font-size:.76rem;font-weight:700;color:var(--rose)">Clique para aproximar ›</span>`;
}

export function FornecedoresMapa({
  fornecedores,
  selecionado,
  onSelecionar,
  vooPara,
}: {
  fornecedores: Fornecedor[];
  selecionado: string | null;
  onSelecionar: (nome: string) => void;
  vooPara: { nome: string; lat: number; lng: number; zoom: number } | null;
}) {
  const mapRef = useRef<LeafletMap | null>(null);
  const camadaRef = useRef<LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const onSelecionarRef = useRef(onSelecionar);
  onSelecionarRef.current = onSelecionar;
  const estadoRef = useRef({ fornecedores, selecionado });
  estadoRef.current = { fornecedores, selecionado };

  useEffect(() => {
    let cancelado = false;

    import("leaflet").then((L) => {
      if (cancelado || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: false, scrollWheelZoom: true }).setView(CENTRO_BRASIL, 4);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const camada = L.layerGroup().addTo(map);
      mapRef.current = map;
      camadaRef.current = camada;

      function iconePin(fornecedor: Fornecedor, ativo: boolean) {
        const classe = `pin${ativo ? " on" : fornecedor.verificado ? " ver" : ""}`;
        return L.divIcon({
          className: "",
          iconSize: [34, 34],
          iconAnchor: [17, 32],
          popupAnchor: [0, -30],
          html: `<div class="${classe}"><b>${fornecedor.ofertas}</b></div>`,
        });
      }

      function iconeBolha(n: number) {
        return L.divIcon({
          className: "",
          iconSize: [56, 56],
          iconAnchor: [28, 28],
          popupAnchor: [0, -26],
          html: `<div class="bubble"><b>${n}</b><span>lojas</span></div>`,
        });
      }

      function desenhar() {
        const cam = camadaRef.current;
        const mp = mapRef.current;
        if (!cam || !mp) return;
        cam.clearLayers();
        const { fornecedores: lista, selecionado: sel } = estadoRef.current;
        const agrupado = mp.getZoom() < ZOOM_AGRUPADO;
        if (hintRef.current) hintRef.current.style.display = agrupado ? "block" : "none";

        if (agrupado) {
          const cidades = new Map<string, Fornecedor[]>();
          for (const fornecedor of lista) {
            const grupo = cidades.get(fornecedor.cidade) ?? [];
            grupo.push(fornecedor);
            cidades.set(fornecedor.cidade, grupo);
          }
          for (const [cidade, itens] of cidades) {
            const lat = itens.reduce((soma, item) => soma + item.lat, 0) / itens.length;
            const lng = itens.reduce((soma, item) => soma + item.lng, 0) / itens.length;
            const marcador = L.marker([lat, lng], { icon: iconeBolha(itens.length) })
              .addTo(cam)
              .bindPopup(popupCidade(cidade, itens));
            marcador.on("click", () => mp.flyTo([lat, lng], 13, { duration: 0.8 }));
          }
          return;
        }

        for (const fornecedor of lista) {
          const ativo = fornecedor.nome === sel;
          const marcador = L.marker([fornecedor.lat, fornecedor.lng], { icon: iconePin(fornecedor, ativo) })
            .addTo(cam)
            .bindPopup(popupFornecedor(fornecedor));
          marcador.on("click", () => {
            onSelecionarRef.current(fornecedor.nome);
            marcador.openPopup();
          });
          if (ativo) marcador.openPopup();
        }
      }

      map.on("zoomend", desenhar);
      (map as unknown as { __desenhar?: () => void }).__desenhar = desenhar;
      desenhar();
    });

    return () => {
      cancelado = true;
      mapRef.current?.remove();
      mapRef.current = null;
      camadaRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current as (LeafletMap & { __desenhar?: () => void }) | null;
    map?.__desenhar?.();
  }, [fornecedores, selecionado]);

  useEffect(() => {
    if (!vooPara || !mapRef.current) return;
    mapRef.current.flyTo([vooPara.lat, vooPara.lng], vooPara.zoom, { duration: 0.8 });
  }, [vooPara]);

  return (
    <>
      <div ref={containerRef} id="fornecedores-map" />
      <div className="mapa-hint" ref={hintRef}>Cidades agrupadas · dê zoom para ver cada loja</div>
    </>
  );
}
