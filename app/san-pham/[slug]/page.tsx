import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { relatedOf } from "@/lib/related";
import { catalog, isListed, listLite, toLite } from "@/lib/data";
import { PREVIEW } from "@/lib/links";

export const revalidate = 900; // 15 minutes, matches the KiotViet sync plan

export async function generateStaticParams() {
  const all = (await catalog.listProducts()).filter(isListed);
  // The static preview uses /xem?sp=slug instead, so it only needs one page here.
  return (PREVIEW ? all.slice(0, 1) : all).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await catalog.getProduct((await params).slug);
  return p ? { title: `${p.brand} ${p.title}`, description: `${p.typeLabel} ${p.brand}${p.size ? `, ${p.size}` : ""}. Có dược sĩ tư vấn qua Zalo.` } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = await catalog.getProduct((await params).slug);
  if (!p || !isListed(p)) notFound();
  const related = relatedOf(p, await listLite());
  return <ProductDetail p={p} lite={toLite(p)} related={related} />;
}
