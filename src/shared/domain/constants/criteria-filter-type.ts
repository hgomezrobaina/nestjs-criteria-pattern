/**
 * A query string has no types. This is what decides which filter class a raw string
 * becomes, and it is declared once per field in the entity's `options()`.
 */
export enum CriteriaFilterType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  DATE = "DATE",
  BOOLEAN = "BOOLEAN",
}
