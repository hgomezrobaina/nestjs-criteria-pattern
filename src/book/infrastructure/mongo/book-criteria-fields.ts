import { MongoCriteriaField } from "@shared/infrastructure/mongo/mongo-criteria-builder";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";

/**
 * Public name -> real name in mongo. This is the alias table that a hand-written
 * endpoint only ever writes late and for the one field that moved; here it exists from
 * the start and covers everything, so `id -> _id` stops being a special case.
 *
 * `canSearch` answers the other question: what free-text search looks at. Only what
 * the table shows, because searching by an invisible field leaves rows unexplained.
 */
export const BOOK_CRITERIA_FIELDS: MongoCriteriaField<BookCriteriaField>[] = [
  { field: BookCriteriaField.ID, mongo: "_id", canSearch: false },
  { field: BookCriteriaField.TITLE, mongo: "title", canSearch: true },
  { field: BookCriteriaField.AUTHOR_NAME, mongo: "author.name", canSearch: true },
  {
    field: BookCriteriaField.PUBLISHED_AT,
    mongo: "publishedAt",
    canSearch: false,
  },
  { field: BookCriteriaField.COPIES, mongo: "copies", canSearch: false },
  { field: BookCriteriaField.AVAILABLE, mongo: "available", canSearch: false },
];
