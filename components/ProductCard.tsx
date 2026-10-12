"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import Stretch from "./Stretch";
import LLButton from "./LLButton";
import { useCart } from "@/lib/contexts/CartContext";

export function PriceButton({ price }: { price: string }) {
  return (
    <Button
      size="linkSize"
      variant="link"
      className="font-baskerVilleOld text-4xl w-auto gap-0 tracking-wider flex items-baseline"
    >
      <Stretch size="text-2xl" text={`${price} `} />{" "}
    </Button>
  );
}

type ProductCardProps = {
  articleID?: string;
  title: string;
  price: string;
  href?: string;
  image?: string;
  imageSize?: string;
  variant?: "default" | "noIMG";
  description?: string;
  truncate?: boolean;
};

export default function ProductCard({
  articleID,
  title,
  price,
  href,
  image,
  imageSize = "h-64",
  variant = "default",
  description,
  truncate = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const header = (
    <div className="">
      {articleID && (
        <span className="flex flex-col items-baseline  justify-start font-baskervilleSC lowercase  text-foreground/40 tracking-widest whitespace-nowrap text-xl  gap-x-0">
          ll{articleID}
          <CardTitle className="text-3xl font-baskervilleSC uppercase font-normal tracking-wider mb-1">
            {title}
          </CardTitle>
        </span>
      )}
      {/* <span className="flex-1 self-center block h-px bg-black min-w-8" /> */}
    </div>
  );

  return (
    <Card className="uppercase w-full h-full gap-0 rounded-none font-baskerVilleOld bg-background flex flex-col lg:flex-row items-start justify-start">
      {variant === "default" && image && (
        <div
          className={`relative shrink-0 w-full lg:w-auto lg:aspect-3/4 ${imageSize}`}
        >
          <Image
            src={image.startsWith("http") ? image : `/${image}`}
            alt={title}
            fill
            className="object-contain object-top-left"
          />
        </div>
      )}
      <CardContent className="flex flex-col self-start justify-end w-full lg:w-full items-start p-2">
        {href ? (
          <Link href={href} className="text-2xl font-baskerVilleOld">
            {header}
          </Link>
        ) : (
          header
        )}
        <PriceButton price={price} />
        {description && (
          <div className="w-full pt-2">
            <p
              className={`font-baskerVilleClassic text-xl tracking-wide normal-case ${truncate ? " line-clamp-2" : ""}`}
            >
              PARTIALLY BILINGUAL ISSUE: 𝐈 𝐝𝐞𝐭 𝐟𝐞𝐦𝐭𝐨𝐧𝐝𝐞 𝐧𝐮𝐦𝐫𝐞𝐭 𝐚𝐯 𝐋’𝐀𝐦𝐨𝐮𝐫 – 𝐋𝐚
              𝐌𝐨𝐫𝐭 𝐫𝐢𝐤𝐭𝐚𝐫 𝐯𝐢 𝐛𝐥𝐢𝐜𝐤𝐞𝐧 𝐦𝐨𝐭 𝐭𝐨𝐦𝐫𝐮𝐦𝐦𝐞𝐭. Här har 18 författare,
              poeter, fotografer, astrofysiker, och dansare bjudits in för att
              dela böner, fiktion, översättningar, meditationer och dikter. 𝐈𝐧
              𝐭𝐡𝐞 𝐟𝐢𝐟𝐭𝐞𝐞𝐧𝐭𝐡 𝐢𝐬𝐬𝐮𝐞 𝐨𝐟 𝐋’𝐀𝐦𝐨𝐮𝐫 – 𝐋𝐚 𝐌𝐨𝐫𝐭, 𝐰𝐞 𝐭𝐮𝐫𝐧 𝐨𝐮𝐫 𝐠𝐚𝐳𝐞 𝐭𝐨 𝐭𝐡𝐞
              𝐯𝐨𝐢𝐝. Here, 18 writers, poets, photographers, astrophysicists, and
              dancers have been invited to share prayer, fiction, translations,
              meditations and poems.
            </p>
            {truncate && (
              <Button
                variant="link"
                size="linkSize"
                className="font-baskerVilleClassic text-xl normal-case tracking-widest px-0"
              >
                (Read more)
              </Button>
            )}
          </div>
        )}{" "}
        <span className="inline-flex rounded-[100%] bg-foreground w-full overflow-hidden hover:opacity-75 mt-4 transition-opacity">
          <LLButton
            text="Lägg i korg"
            variant="ghost"
            className="font-baskerVilleClassic text-xl tracking-widest text-background italic hover:bg-transparent hover:text-background px-8 py-2 h-auto w-full lg:w-auto rounded-full"
            onClick={() => addToCart({ id: articleID ?? title, title, price })}
          />
        </span>
      </CardContent>
    </Card>
  );
}
