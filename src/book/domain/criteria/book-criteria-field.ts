/**
 * The whole surface of what a client may name: these are the values that travel in
 * `filters[n][field]` and in `order[by]`. The real column name is resolved in
 * infrastructure.
 *
 * `acquisitionPrice` is missing on purpose. Adding it to the schema does not widen the
 * API, because widening the API means editing this file.
 *
 * `authorName` is here even though no book document has such a property: the enum is
 * the vocabulary of the list, not of the schema.
 */
export enum BookCriteriaField {
  ID = "id",
  TITLE = "title",
  AUTHOR_NAME = "authorName",
  PUBLISHED_AT = "publishedAt",
  COPIES = "copies",
  AVAILABLE = "available",
}
