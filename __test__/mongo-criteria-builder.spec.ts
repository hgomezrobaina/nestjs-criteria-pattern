import { describe, expect, it } from "vitest";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";
import { CriteriaOrder } from "@shared/domain/criteria/criteria-order";
import { CriteriaDateFilter } from "@shared/domain/criteria/criteria-date-filter";
import { CriteriaStringFilter } from "@shared/domain/criteria/criteria-string-filter";
import { MongoCriteriaBuilder } from "@shared/infrastructure/mongo/mongo-criteria-builder";
import { BookCriteria } from "@book/domain/criteria/book-criteria";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";
import { BOOK_CRITERIA_FIELDS } from "@book/infrastructure/mongo/book-criteria-fields";

const builder = new MongoCriteriaBuilder<BookCriteriaField>();

function build(criteria: BookCriteria) {
  return builder.execute({ criteria: criteria, fields: BOOK_CRITERIA_FIELDS });
}

describe("MongoCriteriaBuilder", () => {
  it("translates the public name into the real one in mongo", () => {
    const result = build(
      new BookCriteria({
        filters: [
          new CriteriaStringFilter({
            field: BookCriteriaField.ID,
            operator: CriteriaFilterOperator.EQUAL,
            values: ["book-1"],
          }),
        ],
      }),
    );

    expect(result.filter.$and).toEqual([{ _id: "book-1" }]);
  });

  it("keeps a field that lives in another collection as a dotted path", () => {
    const result = build(
      new BookCriteria({
        filters: [
          new CriteriaStringFilter({
            field: BookCriteriaField.AUTHOR_NAME,
            operator: CriteriaFilterOperator.EQUAL,
            values: ["Frank Herbert"],
          }),
        ],
      }),
    );

    expect(result.filter.$and).toEqual([{ "author.name": "Frank Herbert" }]);
  });

  it("emits one fragment per filter, so an interval is two conditions", () => {
    const result = build(
      new BookCriteria({
        filters: [
          new CriteriaDateFilter({
            field: BookCriteriaField.PUBLISHED_AT,
            operator: CriteriaFilterOperator.GTE,
            values: [new Date("1960-01-01T00:00:00.000Z")],
          }),
          new CriteriaDateFilter({
            field: BookCriteriaField.PUBLISHED_AT,
            operator: CriteriaFilterOperator.LTE,
            values: [new Date("1970-01-01T00:00:00.000Z")],
          }),
        ],
      }),
    );

    expect(result.filter.$and).toHaveLength(2);
  });

  it("searches only the fields marked as searchable", () => {
    const result = build(new BookCriteria({ search: "dune" }));

    const keys = (result.filter.$or ?? []).map(
      (branch: Record<string, unknown>) => Object.keys(branch)[0],
    );

    expect(keys).toEqual(["title", "author.name"]);
  });

  it("escapes the search term, because $regex would interpret it", () => {
    const result = build(new BookCriteria({ search: "a.*b" }));

    const [first] = result.filter.$or as Array<Record<string, { $regex: string }>>;

    expect(first.title.$regex).toBe("a\\.\\*b");
  });

  it("ignores an order over a field that is not in the map", () => {
    const result = build(
      new BookCriteria({
        order: new CriteriaOrder({
          orderBy: "acquisitionPrice",
          orderType: CriteriaOrderType.DESC,
        }),
      }),
    );

    expect(result.order).toBeNull();
  });

  it("turns page and pageSize into skip and limit", () => {
    const result = build(new BookCriteria({ page: 3, pageSize: 20 }));

    expect(result.skip).toBe(40);
    expect(result.limit).toBe(20);
  });
});
