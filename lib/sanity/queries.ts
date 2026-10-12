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
  cover,
  spine,
  back,
  price,
  weight,
  inStock,
  publishedAt,
  dimensions,
  description,
  "previewImages": previewImages[] { _key, alt, asset }
}`;

export const issueBySlugQuery = groq`*[_type == "issue" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  issueNumber,
  cover,
  spine,
  back,
  "previewImages": previewImages[] { _key, alt, asset },
  description,
  price,
  weight,
  stripePriceId,
  inStock,
  publishedAt,
  dimensions
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
