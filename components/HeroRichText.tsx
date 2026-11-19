import {
  PortableText,
  toPlainText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import { Link } from "@/i18n/navigation";

export type RichText = PortableTextBlock[];

// A hero text from Sanity as rich text, or the built-in `fallback` when it
// has none. A plain string (Hero Texts saved before it became rich text)
// is turned into paragraphs, one per blank-line-separated part
export function toRichText(
  value: RichText | string | null | undefined,
  fallback: string,
): RichText {
  if (Array.isArray(value) && toPlainText(value).trim()) return value;
  const text =
    typeof value === "string" && value.trim() ? value.trim() : fallback;
  return text.split(/\n\s*\n/).map((para, i) => ({
    _type: "block",
    _key: `p${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${i}`, text: para, marks: [] }],
  }));
}

// Links: to a page on the site through the site's Link (keeps the
// language); anywhere else opened in a new tab. Underlined, clickable
// even where the hero lets clicks through (pointer-events-auto)
const LINK =
  "pointer-events-auto underline underline-offset-4 decoration-1 hover:opacity-60 transition-opacity";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    // The first line set in
    indent: ({ children }) => (
      <p className="indent-6 lg:indent-12">{children}</p>
    ),
  },
  marks: {
    em: ({ children }) => <em className="italic">{children}</em>,
    strong: ({ children }) => <strong>{children}</strong>,
    link: ({ value, children }) => {
      const href: string = value?.href ?? "";
      return href.startsWith("/") ? (
        <Link href={href} className={LINK}>
          {children}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noreferrer" className={LINK}>
          {children}
        </a>
      );
    },
  },
};

// A hero's rich text: its paragraphs with no space between them, each after the first indented (24px, 48px on desktop), in the box's own style
// (`className`: font, size, alignment…)
export default function HeroRichText({
  value,
  className = "",
}: {
  value: RichText;
  className?: string;
}) {
  return (
    <div className={`[&>p+p]:indent-6 lg:[&>p+p]:indent-12 ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}
