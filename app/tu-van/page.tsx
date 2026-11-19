import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";
import { catalog, listLite } from "@/lib/data";

export const metadata: Metadata = { title: "Tư vấn da", description: "7 câu hỏi, 2 phút. Nhận chu trình sáng và tối kèm lời dặn của dược sĩ." };

export default async function Page() {
  const [lite, rules] = await Promise.all([listLite(), catalog.conflictRules()]);
  return <Quiz products={lite} rules={rules.rules} />;
}
