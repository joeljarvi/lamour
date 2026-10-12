import LLBookshelf from "@/components/LLBookshelf";

export const revalidate = 3600;

export default function ShopPage() {
  return (
    <section className="flex flex-col w-full">
      <LLBookshelf variant="issues" />
    </section>
  );
}
