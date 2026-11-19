import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog";
import { listLite } from "@/lib/data";

export const metadata: Metadata = { title: "Sản phẩm", description: "Dược mỹ phẩm lọc theo nhu cầu da, loại sản phẩm và thương hiệu." };

export default async function Page() {
  return <Catalog products={await listLite()} />;
}
