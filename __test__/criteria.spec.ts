import { describe, expect, it } from "vitest";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";
import { CriteriaBooleanFilter } from "@shared/domain/criteria/criteria-boolean-filter";
import { CriteriaDateFilter } from "@shared/domain/criteria/criteria-date-filter";
import { BookCriteria } from "@book/domain/criteria/book-criteria";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";

describe("Criteria", () => {
  it("returns every filter over the same field, because an interval is two", () => {
    const criteria = new BookCriteria({
      filters: [
        new CriteriaDateFilter({
          field: BookCriteriaField.PUBLISHED_AT,
          operator: CriteriaFilterOperator.GTE,
          values: [new Date("1960-01-01")],
        }),
        new CriteriaDateFilter({
          field: BookCriteriaField.PUBLISHED_AT,
          operator: CriteriaFilterOperator.LTE,
          values: [new Date("1970-01-01")],
        }),
      ],
    });

    expect(criteria.find(BookCriteriaField.PUBLISHED_AT)).toHaveLength(2);
  });

  it("keeps a server-imposed filter when the client sends its own list", () => {
    const criteria = new BookCriteria();

    // what the request brings replaces the list...
    criteria.setFilters([
      new CriteriaDateFilter({
        field: BookCriteriaField.PUBLISHED_AT,
        operator: CriteriaFilterOperator.GTE,
        values: [new Date("1960-01-01")],
      }),
    ]);

    // ...and what the server imposes is added afterwards, so it cannot be dropped
    criteria.addFilters([
      new CriteriaBooleanFilter({
        field: BookCriteriaField.AVAILABLE,
        operator: CriteriaFilterOperator.EQUAL,
        value: true,
      }),
    ]);

    expect(criteria.find(BookCriteriaField.AVAILABLE)).toHaveLength(1);
    expect(criteria.filters).toHaveLength(2);
  });
});
