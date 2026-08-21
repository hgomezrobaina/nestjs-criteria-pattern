/**
 * The operators a client may name. They are words and not symbols (`>=`) because they
 * travel in a query string, where a symbol would have to be escaped on every request.
 */
export enum CriteriaFilterOperator {
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  GT = "GT",
  GTE = "GTE",
  LT = "LT",
  LTE = "LTE",
  CONTAINS = "CONTAINS",
  IN = "IN",
}
