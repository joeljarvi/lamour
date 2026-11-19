import { getTranslations } from "next-intl/server";
import { client } from "@/lib/sanity/client";
import { currentEditorsQuery } from "@/lib/sanity/queries";

// The about page's "Redaktionen": the editorial team, taken from the
// latest issue's editors in Sanity (one name per line). In the hero's
// column (359px in, 721px wide on desktop), side borders like it, on the
// 24px rows (24px padding, 24px lines)
export default async function EditorsSection() {
  const [editors, t] = await Promise.all([
    client.withConfig({ useCdn: false }).fetch<string | null>(
      currentEditorsQuery,
    ),
    getTranslations("Nav"),
  ]);
  const names = (editors ?? "")
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean);

  return (
    // id: the about page's submenu link ("Redaktionen")
    <section
      id="editors"
      data-section="editors"
      className="flex flex-col gap-6 px-3 lg:px-[24px] py-[24px] pStyle lg:pl-0 lg:ml-(--layout-ml) lg:pr-(--layout-mr) lg:transition-[margin,padding] lg:duration-500 lg:ease-in-out"
    >
      <h2>{t("sectionEditors")}</h2>
      {names.length > 0 && (
        <ul className="flex list-none flex-col">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
