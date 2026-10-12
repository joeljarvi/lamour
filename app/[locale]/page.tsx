import LLBookshelf from "@/components/LLBookshelf";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <section className="flex flex-col w-full ">
      <LLBookshelf variant="home" />
      <Footer />
    </section>
  );
}
