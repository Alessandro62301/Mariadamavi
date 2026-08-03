import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import {
  createProductWhatsAppMessage,
  createWhatsAppLink,
  formatPrice,
  getProductsByCategory,
  getSavings,
  getVariant,
  type CategorySlug,
  type Product,
} from "@/lib/storefront";

const sectionConfig: Array<{
  slug: CategorySlug;
  label: string;
  title: string;
}> = [
  { slug: "iphones-lacrados", label: "IPHONES LACRADOS", title: "Os mais vendidos" },
  { slug: "iphones-seminovos", label: "IPHONES SEMINOVOS", title: "Modelos prontos para entrega" },
  { slug: "ipads", label: "IPADS", title: "Tablets para estudo, criacao e rotina" },
  { slug: "macbooks", label: "MACBOOKS", title: "Selecionados para trabalho serio" },
];

const trustItems = [
  { icon: ShieldCheck, text: "Serial verificavel" },
  { icon: PackageCheck, text: "Pago na entrega" },
  { icon: Smartphone, text: "6 meses garantia" },
  { icon: Truck, text: "Entrega hoje" },
];

const benefits = [
  {
    icon: Truck,
    title: "Entrega em maos",
    description: "Niteroi, SG e Marica. Voce recebe, testa e decide.",
  },
  {
    icon: ShieldCheck,
    title: "Serial verificavel",
    description: "Lacrado com caixa original. IMEI checavel direto na Apple.",
  },
  {
    icon: CreditCard,
    title: "Parcela em 12x",
    description: "No cartao sem juros ou desconto a vista no Pix.",
  },
  {
    icon: PackageCheck,
    title: "6 meses de garantia",
    description: "Defeito funcional? Resolvemos pelo WhatsApp. Sem burocracia.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-pill">
            <span className="hero-dot" />
            Entregamos hoje em Niteroi, SG e Marica
          </div>

          <h1 className="hero-title">
            <span>iPhones importados.</span>
            <span>Voce testa.</span>
            <span className="accent">So entao paga.</span>
          </h1>

          <p className="hero-subtitle">
            Lacrados dos EUA com serial verificavel. Entregamos em maos em Niteroi, SG e
            Marica.
          </p>

          <div className="hero-actions">
            <Link href="/catalogo/iphones-lacrados" className="btn-primary">
              Ver iPhones Lacrados <ArrowRight size={16} />
            </Link>
            <a
              href="#como-funciona"
              className="btn-ghost"
            >
              Como funciona
            </a>
          </div>

          <div className="hero-trust">
            {trustItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={item.text} className="trust-item">
                  <Icon size={14} />
                  <span>{item.text}</span>
                  {index < trustItems.length - 1 ? (
                    <span className="trust-separator">·</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="page-shell">
        <section className="container section-stack">
          {sectionConfig.map((section, index) => (
            <div key={section.slug}>
              <CategorySection
                categorySlug={section.slug}
                label={section.label}
                title={section.title}
              />

              {index === 0 ? (
                <section id="como-funciona" className="section-divider">
                  <div className="benefits-grid">
                    {benefits.map((item) => {
                      const Icon = item.icon;

                      return (
                        <article key={item.title} className="benefit-item">
                          <Icon size={24} />
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function CategorySection({
  categorySlug,
  label,
  title,
}: {
  categorySlug: CategorySlug;
  label: string;
  title: string;
}) {
  const products = getProductsByCategory(categorySlug).slice(0, 4);

  return (
    <section>
      <div className="section-header">
        <div>
          <div className="section-label">{label}</div>
          <h2 className="section-title">{title}</h2>
        </div>

        <Link href={`/catalogo/${categorySlug}`} className="section-link">
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>

      <div className="home-grid">
        {products.map((product) => (
          <StorefrontCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

function StorefrontCard({ product }: { product: Product }) {
  const storage = product.storage[0];
  const color = product.cores[0] || "Preto";
  const variant = getVariant(product, storage);
  const savings = getSavings(product, storage);

  return (
    <article className="product-card">
      <Link href={`/produto/${product.slug}`} className="product-image-wrap">
        <img src={product.imagem} alt={product.nome} />
      </Link>

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
        <div className="product-price price-highlight">R$ {formatPrice(variant.preco)}</div>
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
            href={createWhatsAppLink(createProductWhatsAppMessage(product, storage, color))}
            target="_blank"
            rel="noreferrer"
          >
            Quero
          </a>
        </div>
      </div>
    </article>
  );
}
