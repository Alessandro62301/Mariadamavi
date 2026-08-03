"use client";

import Link from "next/link";
import { Eye, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import { useState } from "react";
import {
  createProductWhatsAppMessage,
  createWhatsAppLink,
  formatPrice,
  getSavings,
  getVariant,
  type Product,
} from "@/lib/storefront";
import { addToCart } from "@/lib/browser-store";

const defaultColor = (product: Product) => product.cores[0] || "Preto";

export function ProductPage({ product }: { product: Product }) {
  const [storage, setStorage] = useState(product.storage[0]);
  const [color, setColor] = useState(defaultColor(product));
  const variant = getVariant(product, storage);
  const savings = getSavings(product, storage);

  return (
    <main className="page-shell">
      <section className="container section-stack">
        <div className="breadcrumb">
          <Link href="/">Inicio</Link>
          <span>/</span>
          <Link href={`/catalogo/${product.categoriaSlug}`}>Catalogo</Link>
          <span>/</span>
          <span>{product.nome}</span>
        </div>

        <div className="product-layout">
          <div className="product-gallery">
            <div className="product-image-stage">
              <img src={product.imagem} alt={product.nome} />
            </div>
          </div>

          <div className="product-summary">
            <p className="product-eyebrow">{product.categoria}</p>
            <h1>{product.nome}</h1>
            <p className="product-meta">{product.subtitulo}</p>

            <div className="variant-block">
              <span className="variant-label">Armazenamento</span>
              <div className="chip-row">
                {product.storage.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`choice-chip ${storage === item ? "active" : ""}`}
                    onClick={() => setStorage(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="variant-block">
              <span className="variant-label">Cor</span>
              <div className="chip-row">
                {product.cores.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`choice-chip ${color === item ? "active" : ""}`}
                    onClick={() => setColor(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="price-card">
              <div className="price-old">Apple Store R$ {formatPrice(product.precoApple)}</div>
              <div className="detail-price price-highlight">R$ {formatPrice(variant.preco)}</div>
              <div className="price-pix">⚡ a vista no Pix</div>
              <div className="savings-chip">
                Na Mavi voce economiza R$ {formatPrice(savings)}
              </div>

              <div className="payment-grid">
                <div className="payment-box">
                  <span>12x de</span>
                  <strong>R$ {formatPrice(variant.parcela12x)}</strong>
                  <small>no cartao</small>
                </div>
                <div className="payment-box">
                  <span>21x de</span>
                  <strong>R$ {formatPrice(variant.parcela21x)}</strong>
                  <small>se disponivel</small>
                </div>
              </div>
            </div>

            <div className="cta-stack">
              <a
                className="btn-primary btn-large"
                href={createWhatsAppLink(createProductWhatsAppMessage(product, storage, color))}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                Quero esse no WhatsApp
              </a>
              <button
                type="button"
                className="btn-ghost btn-large"
                onClick={() => addToCart(product, storage, color)}
              >
                <ShoppingBag size={18} />
                Adicionar ao carrinho
              </button>
              <div className="view-pill">
                <Eye size={14} />
                {product.visualizacoesHoje} pessoas viram esse produto hoje
              </div>
              <div className="guarantee-pill">
                <ShieldCheck size={16} />
                {product.garantia}
              </div>
            </div>
          </div>
        </div>

        <section className="specs-section">
          <div>
            <div className="section-label">ESPECIFICACOES</div>
            <h2>Ficha tecnica objetiva</h2>
          </div>

          <div className="specs-grid">
            <Spec title="Tela" value={product.especificacoes.tela} />
            <Spec title="Armazenamento" value={storage} />
            <Spec title="Chip" value={product.especificacoes.chip} />
            <Spec title="Cor" value={color} />
            <Spec title="Camera principal" value={product.especificacoes.cameraPrincipal} />
            <Spec title="Camera frontal" value={product.especificacoes.cameraFrontal} />
            <Spec title="Bateria" value={product.especificacoes.bateria} />
            <Spec title="Face ID" value={product.especificacoes.faceId} />
            <Spec title="Estado" value={product.especificacoes.estado} />
            <Spec title="IMEI verificavel" value={product.especificacoes.imeiVerificavel} />
            <Spec title="Garantia Mavi" value={product.especificacoes.garantiaMavi} />
            <Spec title="Ano do modelo" value={product.especificacoes.anoModelo} />
          </div>
        </section>
      </section>
    </main>
  );
}

function Spec({ title, value }: { title: string; value: string }) {
  return (
    <article className="spec-card">
      <span className="spec-label">{title}</span>
      <strong className="spec-value">{value}</strong>
    </article>
  );
}
