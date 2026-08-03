"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  createCartWhatsAppMessage,
  createWhatsAppLink,
  formatPrice,
  getProductBySlug,
  getVariant,
  type CartItem,
} from "@/lib/storefront";
import { readCart, removeCartItem, updateCartItem } from "@/lib/browser-store";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.48 0 .11 5.37.11 11.96c0 2.11.55 4.18 1.6 6L0 24l6.21-1.62a11.93 11.93 0 0 0 5.86 1.5h.01c6.58 0 11.95-5.37 11.95-11.96 0-3.19-1.24-6.19-3.51-8.44ZM12.08 21.9h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.68.96.98-3.59-.24-.37A9.88 9.88 0 0 1 2.1 11.96C2.1 6.48 6.58 2 12.08 2c2.64 0 5.12 1.03 6.99 2.9a9.8 9.8 0 0 1 2.9 7c0 5.49-4.48 9.98-9.89 10ZM17.5 14.42c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.19.3-.76.98-.93 1.18-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.48a8.96 8.96 0 0 1-1.65-2.06c-.18-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.49.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.01-1.04 2.46 0 1.45 1.07 2.86 1.22 3.06.15.2 2.08 3.17 5.04 4.45.7.3 1.25.48 1.67.61.7.22 1.34.19 1.84.11.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.12-.28-.19-.58-.34Z"
      />
    </svg>
  );
}

export function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  function refresh() {
    setItems(readCart());
  }

  const total = items.reduce((sum, item) => {
    const product = getProductBySlug(item.slug);
    if (!product) {
      return sum;
    }
    return sum + getVariant(product, item.storage).preco * item.quantidade;
  }, 0);

  return (
    <main className="page-shell">
      <section className="cart-layout">
        <div className="breadcrumb">
          <Link href="/">Inicio</Link>
          <span>/</span>
          <span>Carrinho</span>
        </div>

        <div className="section-heading compact">
          <div>
            <div className="section-label">PEDIDO</div>
            <h1>Feche pelo WhatsApp quando estiver pronto</h1>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ShoppingBag size={40} />
            </div>
            <h2>Seu carrinho esta vazio</h2>
            <p className="catalog-copy">Escolha um produto e monte o pedido com poucos cliques.</p>
            <Link href="/catalogo/iphones-lacrados" className="btn-ghost">
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            {items.map((item) => {
              const product = getProductBySlug(item.slug);
              if (!product) {
                return null;
              }

              const variant = getVariant(product, item.storage);

              return (
                <article key={`${item.slug}-${item.storage}-${item.cor}`} className="cart-item">
                  <div className="cart-item-img">
                    <img src={product.imagem} alt={product.nome} />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-name">{product.nome}</div>
                    <div className="cart-item-price">R$ {formatPrice(variant.preco)}</div>
                    <div className="cart-item-spec">
                      {item.storage} · {item.cor}
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => {
                        updateCartItem(item.slug, item.storage, item.cor, item.quantidade - 1);
                        refresh();
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantidade}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => {
                        updateCartItem(item.slug, item.storage, item.cor, item.quantidade + 1);
                        refresh();
                      }}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => {
                        removeCartItem(item.slug, item.storage, item.cor);
                        refresh();
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}

            <section className="cart-summary">
              <div className="summary-total-label">Total do pedido</div>
              <div className="summary-total-value">R$ {formatPrice(total)}</div>
              <div className="price-pix">⚡ a vista no Pix</div>
              <a
                className="btn-whatsapp-green"
                href={createWhatsAppLink(createCartWhatsAppMessage(items))}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon />
                Fechar pedido no WhatsApp
              </a>
              <p className="summary-helper">Resposta em ate 5 minutos</p>
              <p className="summary-brands">Pix · Visa · Master · Elo · Amex</p>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
