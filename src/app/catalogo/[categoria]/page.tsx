import { notFound } from "next/navigation";
import { CatalogPage } from "@/components/storefront/CatalogPage";
import { categoryMeta, type CategorySlug } from "@/lib/storefront";

export function generateStaticParams() {
  return Object.keys(categoryMeta).map((categoria) => ({ categoria }));
}

export default async function Page(props: PageProps<"/catalogo/[categoria]">) {
  const { categoria } = await props.params;

  if (!(categoria in categoryMeta)) {
    notFound();
  }

  return <CatalogPage categorySlug={categoria as CategorySlug} />;
}
