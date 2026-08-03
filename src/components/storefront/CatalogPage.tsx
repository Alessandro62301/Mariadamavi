"use client";

import Link from "next/link";
import { Heart, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import {
  categoryFilters,
  categoryMeta,
  createProductWhatsAppMessage,
  createWhatsAppLink,
  formatPrice,
  getFirstStorage,
  getProductsByCategory,
  getSavings,
  getVariant,
  type Availability,
  type CategorySlug,
} from "@/lib/storefront";
import { readWishlist, toggleWishlist } from "@/lib/browser-store";

type FilterState = {
  categories: string[];
  conditions: string[];
  availability: Availability[];
  storage: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
};

const PAGE_SIZE = 5;

export function CatalogPage({ categorySlug }: { categorySlug: CategorySlug }) {
  const products = getProductsByCategory(categorySlug);
  const prices = products.map((product) => getVariant(product, getFirstStorage(product)).preco);
  const minProductPrice = Math.min(...prices);
  const maxProductPrice = Math.max(...prices);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState("Menor preco");
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState<string[]>(() => readWishlist());
  const [filters, setFilters] = useState<FilterState>({
    categories: [categorySlug],
    conditions: [],
    availability: [],
    storage: [],
    colors: [],
    priceMin: minProductPrice,
    priceMax: maxProductPrice,
  });

  const filtered = products
    .filter((product) => {
      const defaultStorage = getFirstStorage(product);
      const variant = getVariant(product, defaultStorage);
      const conditionLabel = product.condicao === "lacrado" ? "Novo Lacrado" : "Seminovo";

      const categoryMatch =
        filters.categories.length === 0 || filters.categories.includes(product.categoriaSlug);
      const conditionMatch =
        filters.conditions.length === 0 || filters.conditions.includes(conditionLabel);
      const availabilityMatch =
        filters.availability.length === 0 || filters.availability.includes(product.disponibilidade);
      const storageMatch =
        filters.storage.length === 0 ||
        product.storage.some((storage) => filters.storage.includes(storage));
      const colorMatch =
        filters.colors.length === 0 ||
        product.cores.some((color) => filters.colors.includes(color)) ||
        filters.colors.includes("Todas as cores");
      const priceMatch = variant.preco >= filters.priceMin && variant.preco <= filters.priceMax;

      return (
        categoryMatch &&
        conditionMatch &&
        availabilityMatch &&
        storageMatch &&
        colorMatch &&
        priceMatch
      );
    })
    .sort((a, b) => {
      const priceA = getVariant(a, getFirstStorage(a)).preco;
      const priceB = getVariant(b, getFirstStorage(b)).preco;

      if (sort === "Maior preco") {
        return priceB - priceA;
      }

      if (sort === "Mais recente") {
        return b.lancamento - a.lancamento;
      }

      return priceA - priceB;
    });

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const meta = categoryMeta[categorySlug];

  function toggleFilter(
    key: keyof Pick<FilterState, "categories" | "conditions" | "availability" | "storage" | "colors">,
    value: string,
  ) {
    setPage(1);
    setFilters((current) => {
      const list = current[key] as string[];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  }

  return (
    <main className="page-shell">
      <section className="container section-stack">
        <div className="breadcrumb">
          <Link href="/">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo/iphones-lacrados">Catalogo</Link>
          <span>/</span>
          <span>{meta.titulo}</span>
        </div>

        <div className="catalog-hero">
          <div className="catalog-eyebrow">{meta.titulo.toUpperCase()}</div>

          <div className="catalog-heading">
            <div>
              <h1>{meta.titulo}</h1>
              <p className="catalog-copy">{meta.subtitulo}</p>
            </div>

            <div className="catalog-toolbar">
              <span>{filtered.length} produtos</span>
              <label className="sort-select">
                <select
                  value={sort}
                  onChange={(event) => {
                    setPage(1);
                    setSort(event.target.value);
                  }}
                >
                  <option>Menor preco</option>
                  <option>Maior preco</option>
                  <option>Mais recente</option>
                </select>
              </label>
              <button
                className="filter-toggle"
                type="button"
                onClick={() => setMobileFiltersOpen((current) => !current)}
              >
                <SlidersHorizontal size={16} />
                Filtros
              </button>
            </div>
          </div>
        </div>

        <div className="catalog-layout">
          <aside className={`sidebar-panel ${mobileFiltersOpen ? "open" : ""}`}>
            <FilterGroup title="Categoria">
              {categoryFilters.categorias.map((item) => (
                <CheckboxRow
                  key={item.value}
                  checked={filters.categories.includes(item.value)}
                  label={item.label}
                  onChange={() => toggleFilter("categories", item.value)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Condicao">
              {categoryFilters.condicoes.map((item) => (
                <CheckboxRow
                  key={item}
                  checked={filters.conditions.includes(item)}
                  label={item}
                  onChange={() => toggleFilter("conditions", item)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Disponibilidade">
              {categoryFilters.disponibilidade.map((item) => (
                <CheckboxRow
                  key={item}
                  checked={filters.availability.includes(item as Availability)}
                  label={item}
                  onChange={() => toggleFilter("availability", item)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Armazenamento">
              {categoryFilters.armazenamento.map((item) => (
                <CheckboxRow
                  key={item}
                  checked={filters.storage.includes(item)}
                  label={item}
                  onChange={() => toggleFilter("storage", item)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Cor">
              {categoryFilters.cores.map((item) => (
                <CheckboxRow
                  key={item}
                  checked={filters.colors.includes(item)}
                  label={item}
                  onChange={() => toggleFilter("colors", item)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Faixa de preco">
              <div className="range-shell">
                <div className="range-values">
                  <span>R$ {formatPrice(filters.priceMin)}</span>
                  <span>R$ {formatPrice(filters.priceMax)}</span>
                </div>
                <div className="range-track">
                  <input
                    type="range"
                    min={minProductPrice}
                    max={maxProductPrice}
                    value={filters.priceMin}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        priceMin: Math.min(value, current.priceMax - 100),
                      }));
                    }}
                  />
                  <input
                    type="range"
                    min={minProductPrice}
                    max={maxProductPrice}
                    value={filters.priceMax}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setPage(1);
                      setFilters((current) => ({
                        ...current,
                        priceMax: Math.max(value, current.priceMin + 100),
                      }));
                    }}
                  />
                </div>
              </div>
            </FilterGroup>
          </aside>

          <div className="catalog-content section-stack">
            <div className="products-grid">
              {visible.map((product) => {
                const storage = getFirstStorage(product);
                const color = product.cores[0] || "Preto";
                const variant = getVariant(product, storage);
                const isWishlisted = wishlist.includes(product.slug);
                const savings = getSavings(product, storage);

                return (
                  <article key={product.slug} className="product-card">
                    <div className="product-image-wrap">
                      <Link href={`/produto/${product.slug}`} className="btn-block">
                        <img src={product.imagem} alt={product.nome} />
                      </Link>
                      <button
                        type="button"
                        aria-label="Adicionar aos favoritos"
                        className={`product-heart ${isWishlisted ? "active" : ""}`}
                        onClick={(event) => {
                          event.preventDefault();
                          setWishlist(toggleWishlist(product.slug));
                        }}
                      >
                        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="product-body">
                      <div className="product-badge-row">
                        <span className={`condition-badge ${product.condicao}`}>
                          {product.condicao === "lacrado" ? "Lacrado" : "Seminovo"}
                        </span>
                      </div>

                      <Link href={`/produto/${product.slug}`} className="product-name">
                        {product.nome}
                      </Link>
                      <p className="product-spec">{product.subtitulo}</p>

                      <div className={product.precoApple ? "price-old" : "price-old empty"}>
                        Apple Store R$ {formatPrice(product.precoApple)}
                      </div>
                      <div className="product-price price-highlight">
                        R$ {formatPrice(variant.preco)}
                      </div>
                      <div className="price-pix">⚡ a vista no Pix</div>

                      {product.precoApple > variant.preco ? (
                        <div className="savings-chip">
                          Na Mavi voce economiza R$ {formatPrice(savings)}
                        </div>
                      ) : null}

                      <div className="installments-row">
                        <div className="installment-box">
                          12x de <strong>R$ {formatPrice(variant.parcela12x)}</strong>
                        </div>
                        <div className="installment-box">
                          21x de <strong>R$ {formatPrice(variant.parcela21x)}</strong>
                        </div>
                      </div>

                      <div className="card-actions">
                        <Link href={`/produto/${product.slug}`} className="btn-ghost btn-block">
                          Ver produto
                        </Link>
                        <a
                          className="btn-primary btn-block"
                          href={createWhatsAppLink(
                            createProductWhatsAppMessage(product, storage, color),
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Quero
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {visible.length === 0 ? (
              <div className="empty-inline">Nenhum produto encontrado com os filtros atuais.</div>
            ) : null}

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`page-link ${pageNumber === currentPage ? "active" : ""}`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="filter-group">
      <h2 className="filter-title">{title}</h2>
      {children}
    </section>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="checkbox-row">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
