import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { PREVIEW } from "@/lib/links";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode };

/** Next <Link> in production, a plain <a> in the static preview. */
export function A({ href, children, ...rest }: Props) {
  if (PREVIEW || /^https?:/.test(href)) return <a href={href} {...rest}>{children}</a>;
  return <Link href={href} {...rest}>{children}</Link>;
}
