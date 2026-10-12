import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";

function buildComponents(category?: string): PortableTextComponents {
  const normalAlign = category === "interview" ? "text-center" : "text-left";
  return {
    block: {
      normal: ({ children, value }) => {
        if ((value as any)._empty) return null;
        const indent = (value as any)._indented ? "indent-16" : "";
        return (
          <p className={`font-baskerVV text-2xl leading-[1.2] tracking-wide ${normalAlign} ${indent} max-w-3xl mx-auto `}>
            {children}
          </p>
        );
      },
      h1: ({ children }) => (
        <h1 className="font-baskerVV text-4xl tracking-wider  mb-4 mt-8 text-center">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="font-baskerVilleOld text-2xl tracking-widest text-center  mb-3 mt-6">
          {children}
        </h2>
      ),
      blockquote: ({ children }) => (
        <blockquote className="font-baskerVV text-xl italic border-l-2 border-foreground pl-6 my-6 text-foreground/80">
          {children}
        </blockquote>
      ),
      quote: ({ children }) => (
        <blockquote className="font-baskerVilleOld text-2xl text-center italic my-8 px-8 text-foreground/90">
          {children}
        </blockquote>
      ),
      preamble: ({ children }) => (
        <p className="font-universTypewriter  text-xl tracking-wide max-w-5xl mx-auto  text-center leading-[1.2] mb-6">
          {children}
        </p>
      ),
      key: ({ children }) => (
        <p className="font-baskervilleSC tracking-widest uppercase text-sm mb-2">
          {children}
        </p>
      ),
      name: ({ children }) => (
        <p className="font-baskervilleSC tracking-wider   text-2xl text-center leading-none lowercase  text-foreground/40  ">
          {children}
        </p>
      ),
    },
    types: {
      image: ({ value }) => (
        <figure className="my-8 max-w-3xl mx-auto">
          <Image
            src={urlFor(value).url()}
            alt={value.alt ?? ""}
            width={1200}
            height={800}
            className="w-full h-auto object-cover"
          />
          {value.alt && (
            <figcaption className="font-universTypewriter text-xs text-center mt-2 opacity-60">
              {value.alt}
            </figcaption>
          )}
        </figure>
      ),
    },
    marks: {
      em: ({ children }) => <em className="italic">{children}</em>,
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      link: ({ value, children }) => (
        <a
          href={value?.href}
          className="underline underline-offset-2 hover:opacity-60 transition-opacity"
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      ),
    },
  };
}

function normalizeStyles(blocks: any[], category?: string): any[] {
  return blocks.map((block, i) => {
    let result = block;

    // existing: after "name" block, force style → normal
    if (i > 0 && blocks[i - 1]?.style === "name" && block._type === "block") {
      result = { ...result, style: "normal" };
    }

    if (category === "article" && block._type === "block" && block.style === "normal") {
      const text = block.children?.map((c: any) => c.text ?? "").join("") ?? "";

      // mark empty blocks so the renderer can suppress them
      if (text.trim() === "") {
        result = { ...result, _empty: true };
      }

      // mark block that follows an empty block as indented
      if (i > 0 && blocks[i - 1]?._type === "block" && blocks[i - 1]?.style === "normal") {
        const prevText =
          blocks[i - 1].children?.map((c: any) => c.text ?? "").join("") ?? "";
        if (prevText.trim() === "") {
          result = { ...result, _indented: true };
        }
      }
    }

    return result;
  });
}

export default function SanityPortableText({
  value,
  category,
}: {
  value: any;
  category?: string;
}) {
  const normalized = Array.isArray(value) ? normalizeStyles(value, category) : value;
  return <PortableText value={normalized} components={buildComponents(category)} />;
}
