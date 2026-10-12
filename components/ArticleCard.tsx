import { Link } from "@/i18n/navigation";
import type { Article } from "@/lib/contexts/ArticlesContext";

const SPINE_HEIGHTS = [
  "h-12 lg:h-[65vh]",
  "h-12 lg:h-[80vh]",
  "h-12 lg:h-[55vh]",
  "h-12 lg:h-[70vh]",
  "h-12 lg:h-[75vh]",
  "h-12 lg:h-[60vh]",
];

const SPINE_COLORS = [
  "#1A4A4A",
  "#5C3A1A",
  "#3D2B5E",
  "#1A4A2E",
  "#8B1A1A",
  "#2A3D5C",
  "#4A1A2E",
  "#2D4A3E",
  "#4A3728",
  "#1A3A5C",
];

export default function ArticleCard({
  article,
  index = 0,
}: {
  article: Article;
  index?: number;
}) {
  const height = SPINE_HEIGHTS[index % SPINE_HEIGHTS.length];
  const color = SPINE_COLORS[index % SPINE_COLORS.length];

  return (
    <Link
      href={`/articles/${article.slug.current}`}
      className={`ml-4 lg:ml-0 relative w-full lg:w-8 lg:shrink-0 ${height} overflow-hidden opacity-60 hover:opacity-100 transition-opacity duration-300`}
    >
      <div className="absolute inset-0 bg-[#B3F7FE]" />
      <span className="lg:hidden absolute inset-0 flex items-center px-4">
        <span className="font-baskervilleSC text-foreground text-sm tracking-widest truncate">
          {article.title}
        </span>
      </span>
      <span className="hidden lg:flex absolute inset-0 items-center justify-center bg-[#B3F7FE]">
        <span
          className="font-baskervilleSC text-foregroundtext-sm tracking-widest whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {article.title}
        </span>
      </span>
    </Link>
  );
}
