import { client } from "@/lib/sanity/client";
import { authorBySlugQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import LogoNav from "@/components/LogoNav";
import LLNav from "@/components/LLNav";
import SanityPortableText from "@/components/SanityPortableText";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

type Author = {
  _id: string;
  name: string;
  slug: { current: string };
  bio?: any[];
  image?: { asset: any; alt?: string };
  articles?: Array<{
    title: string;
    slug: { current: string };
    publishedAt?: string;
    issue?: { title: string; issueNumber: number };
  }>;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let author: Author | null = null;
  try {
    author = await client.fetch(authorBySlugQuery, { slug });
  } catch {
    // Sanity not yet configured
  }

  if (!author) notFound();

  return (
    <>
      <LogoNav />
      <LLNav />
      <section className="flex flex-col mt-[25vh] w-full min-h-screen px-4 pt-8 pb-32">
        <Link
          href="/articles"
          className="font-baskerVilleOld text-xl tracking-widest text-foreground/40 hover:text-foreground transition-colors mb-10 inline-block"
        >
          ← Artiklar
        </Link>

        <div className="flex flex-col md:flex-row gap-10 mb-16">
          {author.image?.asset && (
            <div className="relative w-32 h-32 shrink-0">
              <Image
                src={urlFor(author.image).width(256).url()}
                alt={author.image.alt ?? author.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-4">
            <h1 className="font-baskerVilleOld text-5xl uppercase tracking-[0.2em]">
              {author.name}
            </h1>
            {author.bio && (
              <div className="max-w-prose">
                <SanityPortableText value={author.bio} />
              </div>
            )}
          </div>
        </div>

        {author.articles && author.articles.length > 0 && (
          <div>
            <h2 className="font-baskerVilleOld text-2xl uppercase tracking-[0.25em] border-b border-foreground pb-2 mb-6">
              Artiklar
            </h2>
            <div className="flex flex-col gap-0">
              {author.articles.map((article) => (
                <Link
                  key={article.slug.current}
                  href={`/articles/${article.slug.current}`}
                  className="group flex items-start justify-between border-b border-foreground/20 py-4 hover:px-4 transition-all duration-300"
                >
                  <h3 className="font-baskerVilleOld text-2xl uppercase tracking-[0.15em] leading-relaxed group-hover:opacity-60 transition-opacity">
                    {article.title}
                  </h3>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-baskervilleClassic italic text-sm tracking-wide text-foreground/60">
                      {formatDate(article.publishedAt)}
                    </p>
                    {article.issue && (
                      <p className="font-mono text-xs text-foreground/40 tracking-widest">
                        LL#{article.issue.issueNumber}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
