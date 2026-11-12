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

export const seriesQuery = groq`*[_type == "series"] | order(title asc) {
  _id,
  title,
  slug,
  description,
  aboutText
}`;

export const articlesQuery = groq`*[_type == "article"] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  slug,
  "author": author->{name, slug},
  "issue": issue->{title, issueNumber},
  "series": series->{title, slug},
  coverImage,
  publishedAt,
  color,
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
