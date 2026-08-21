import { describe, expect, it } from "vitest";
import { FindOperator } from "typeorm";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";
import { CriteriaOrder } from "@shared/domain/criteria/criteria-order";
import { CriteriaDateFilter } from "@shared/domain/criteria/criteria-date-filter";
import { CriteriaStringFilter } from "@shared/domain/criteria/criteria-string-filter";
import {
  TypeOrmCriteriaBuilder,
  TypeOrmCriteriaField,
} from "@shared/infrastructure/typeorm/typeorm-criteria-builder";
import { BookCriteria } from "@book/domain/criteria/book-criteria";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";

/**
 * The SQL field map. Same public names as the Mongo one, different right-hand column:
 * this file and the builder are everything that changes when the engine changes.
 */
const FIELDS: TypeOrmCriteriaField<BookCriteriaField>[] = [
  { field: BookCriteriaField.ID, column: "id", canSearch: false },
  { field: BookCriteriaField.TITLE, column: "title", canSearch: true },
  { field: BookCriteriaField.AUTHOR_NAME, column: "author.name", canSearch: true },
  { field: BookCriteriaField.PUBLISHED_AT, column: "publishedAt", canSearch: false },
  { field: BookCriteriaField.COPIES, column: "copies", canSearch: false },
  { field: BookCriteriaField.AVAILABLE, column: "available", canSearch: false },
];

const builder = new TypeOrmCriteriaBuilder<BookCriteriaField>();

function build(criteria: BookCriteria) {
  return builder.execute({ criteria: criteria, fields: FIELDS });
}

describe("TypeOrmCriteriaBuilder", () => {
  it("nests a relation path, because TypeORM does not take a dotted key", () => {
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

    const where = result.where as { author: { name: FindOperator<unknown> } };

    expect(where.author.name).toBeInstanceOf(FindOperator);
    expect(where.author.name.value).toBe("Frank Herbert");
  });

  it("combines two filters over the same column with And()", () => {
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

    const where = result.where as { publishedAt: FindOperator<unknown> };

    expect(where.publishedAt.type).toBe("and");
  });

  it("turns page and pageSize into skip and take", () => {
    const result = build(new BookCriteria({ page: 3, pageSize: 20 }));

    expect(result.skip).toBe(40);
    expect(result.take).toBe(20);
  });

  it("resolves the order against the same map", () => {
    const result = build(
      new BookCriteria({
        order: new CriteriaOrder({
          orderBy: BookCriteriaField.AUTHOR_NAME,
          orderType: CriteriaOrderType.ASC,
        }),
      }),
    );

    expect(result.order).toEqual({ author: { name: "ASC" } });
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

    expect(result.order).toBeUndefined();
  });
});
