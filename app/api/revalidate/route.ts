import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let body: { _type?: string; slug?: { current?: string } } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body._type;
  const slug = body.slug?.current;

  // Pages live under app/[locale], so revalidate each locale's copy
  const revalidate = (path: string) =>
    routing.locales.forEach((locale) =>
      revalidatePath(`/${locale}${path === "/" ? "" : path}`),
    );

  if (type === "issue") {
    revalidate("/shop");
    if (slug) revalidate(`/shop/${slug}`);
  } else if (type === "article") {
    revalidate("/articles");
    if (slug) revalidate(`/articles/${slug}`);
  } else if (type === "author") {
    if (slug) revalidate(`/authors/${slug}`);
  } else {
    revalidate("/");
  }


  return NextResponse.json({ revalidated: true, type, slug });
}
