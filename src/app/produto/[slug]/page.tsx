import { notFound } from "next/navigation";
import { ProductPage } from "@/components/storefront/ProductPage";
import { getProductBySlug, produtos } from "@/lib/storefront";

export function generateStaticParams() {
  return produtos.map((product) => ({ slug: product.slug }));
}

export default async function Page(props: PageProps<"/produto/[slug]">) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} />;
}
