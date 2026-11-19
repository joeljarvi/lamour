import { groq } from "next-sanity";

export const latestIssueQuery = groq`*[_type == "issue"] | order(issueNumber desc)[0] {
  _id,
  title,
  cover
}`;

export const issuesQuery = groq`*[_type == "issue"] | order(issueNumber desc) {
  _id,
  title,
  slug,
  issueNumber,
  language,
  cover,
  productImage,
  useProductImage,
  price,
  weight,
  inStock,
  publishedAt,
  releaseDate,
  dimensions,
  pageCount,
  isbn,
  binding,
  // The issue page's hero background: the Media Library item when one is
  // picked, else the uploaded Hero Image (shaped like backgroundMediaQuery)
  "heroMedia": select(
    defined(heroMediaItem) => heroMediaItem->{
      mediaType,
      image,
      poster,
      "videoUrl": video.asset->url
    },
    defined(heroImage.asset) => { "mediaType": "image", "image": heroImage }
  ),
  description,
  contributors,
  // Renamed from themeEditors; falls back to it for issues saved before
  "editors": coalesce(editors, themeEditors),
  quotes,
  credits,
  "previewImages": previewImages[] { _key, alt, asset }
}`;

export const issueBySlugQuery = groq`*[_type == "issue" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  issueNumber,
  language,
  cover,
  productImage,
  useProductImage,
  // The issue page's hero background: the Media Library item when one is
  // picked, else the uploaded Hero Image (shaped like backgroundMediaQuery)
  "heroMedia": select(
    defined(heroMediaItem) => heroMediaItem->{
      mediaType,
      image,
      poster,
      "videoUrl": video.asset->url
    },
    defined(heroImage.asset) => { "mediaType": "image", "image": heroImage }
  ),
  "previewImages": previewImages[] { _key, alt, asset },
  description,
  contributors,
  // Renamed from themeEditors; falls back to it for issues saved before
  "editors": coalesce(editors, themeEditors),
  quotes,
  credits,
  price,
  weight,
  stripePriceId,
  inStock,
  publishedAt,
  releaseDate,
  dimensions,
  pageCount,
  isbn,
  binding
}`;

// A section background (Hero Media, Subscribe Media…), by its document id:
// the Media Library item chosen as its "Media in use" (Hero Media), or else
// what was uploaded on the document itself
export const backgroundMediaQuery = groq`*[_id == $id][0] {
  ...select(
    defined(active) => active->{
      mediaType,
      image,
      poster,
      "videoUrl": video.asset->url
    },
    {
      mediaType,
      image,
      poster,
      "videoUrl": video.asset->url
    }
  )
}`;

// "Intervjuer" is a category (Interview), not a series, though it's still
// a series document in Sanity: left out of the series, and its articles
// count as interviews outside any series. Once those articles have their
// Category set to Interview and their Series cleared, and the document is
// deleted, this changes nothing
// Checkout: the issues being bought (by id), with what the price and
// shipping are worked out from — read on the server, never trusted from
// the browser
export const checkoutIssuesQuery = groq`*[_type == "issue" && _id in $ids] {
  _id,
  title,
  issueNumber,
  price,
  weight,
  inStock,
  cover
}`;

// Checkout: the shipping price steps per zone (Shipping Rates in Sanity)
export const shippingRatesQuery = groq`*[_id == "shippingRates"][0] {
  sweden[] { maxWeight, price },
  europe[] { maxWeight, price },
  world[] { maxWeight, price },
  pickupEnabled,
  pickupAddress
}`;

// The subscription plans offered on the subscribe page, in order
export const subscriptionPlansQuery = groq`*[_type == "subscriptionPlan" && active != false] | order(order asc, price asc) {
  _id,
  title,
  description,
  price,
  interval,
  intervalCount,
  zone
}`;

// Checkout: one subscription plan (by id)
export const subscriptionPlanQuery = groq`*[_type == "subscriptionPlan" && _id == $id && active != false][0] {
  _id,
  title,
  description,
  price,
  interval,
  intervalCount,
  zone
}`;

// The text under the logo in each page's hero (Hero Texts in Sanity)
export const heroTextsQuery = groq`*[_id == "heroTexts"][0] {
  home,
  shop,
  articles,
  about,
  subscribe
}`;

// The home hero's nav: every issue's cover, newest first (shown in the
// Affären row)
export const heroNavQuery = groq`{
  "issueCovers": *[_type == "issue" && defined(cover.asset)] | order(issueNumber desc) {
    _id,
    title,
    "href": "/shop/" + slug.current,
    "image": cover
  }
}`;

export const seriesQuery = groq`*[_type == "series" && title != "Intervjuer"] | order(title asc) {
  _id,
  title,
  slug,
  description,
  aboutText,
  coverImage
}`;

export const articlesQuery = groq`*[_type == "article"] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  slug,
  "author": author->{name, slug},
  "issue": issue->{title, issueNumber},
  // Not "Intervjuer" (a category, see seriesQuery)
  "series": select(
    series->title == "Intervjuer" => null,
    series->{title, slug}
  ),
  coverImage,
  publishedAt,
  color,
  "category": coalesce(
    category,
    select(series->title == "Intervjuer" => "interview")
  ),
  "bodyLength": length(pt::text(body))
}`;

export const articleBySlugQuery = groq`*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  subtitle,
  slug,
  "author": author->{name, slug, image, bio},
  "issue": issue->{title, issueNumber, slug},
  "series": series->{title, slug, coverImage { asset->, alt }},
  body,
  category,
  publishedAt,
  coverImage { asset->, alt }
}`;

export const authorBySlugQuery = groq`*[_type == "author" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  bio,
  image,
  "articles": *[_type == "article" && references(^._id)] | order(publishedAt desc) {
    title,
    slug,
    publishedAt,
    "issue": issue->{title, issueNumber}
  }
}`;

// The editorial team (the about page's "Redaktionen"): the latest issue's
// editors, as written in Sanity (one per line or comma)
export const currentEditorsQuery = groq`*[_type == "issue"] | order(issueNumber desc)[0].editors`;
