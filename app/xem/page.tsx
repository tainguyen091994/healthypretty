import type { Metadata } from "next";
import { Viewer } from "@/components/Viewer";
import { listLite } from "@/lib/data";

export const metadata: Metadata = { title: "Sản phẩm" };

// Product view for the static preview: one page, product picked by ?sp=slug.
export default async function Page() {
  return <Viewer products={await listLite()} />;
}
