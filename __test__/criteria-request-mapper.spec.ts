import { describe, expect, it } from "vitest";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";
import { CriteriaOrder } from "@shared/domain/criteria/criteria-order";
import { CriteriaNumberFilter } from "@shared/domain/criteria/criteria-number-filter";
import { CriteriaBooleanFilter } from "@shared/domain/criteria/criteria-boolean-filter";
import { MAX_PAGE_SIZE } from "@shared/domain/constants/pagination";
import type { CriteriaRequest } from "@shared/application/dto/criteria-request";
import { BookCriteria } from "@book/domain/criteria/book-criteria";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";
import { BookCriteriaRequestMapper } from "@book/application/criteria/book-criteria-request-mapper";

const mapper = new BookCriteriaRequestMapper();

function map(request: CriteriaRequest, criteria = new BookCriteria()) {
  return mapper.execute({ criteria: criteria, request: request });
}

describe("CriteriaRequestMapper", () => {
  it("drops a filter over a field that is not declared in options()", () => {
    const criteria = map({
      filters: [
        {
          field: "acquisitionPrice",
          operator: CriteriaFilterOperator.GT,
          value: ["0"],
        },
      ],
    } as CriteriaRequest);

    expect(criteria.filters).toHaveLength(0);
  });

  it("turns the raw text into the type declared for the field", () => {
    const criteria = map({
      filters: [
        {
          field: BookCriteriaField.COPIES,
          operator: CriteriaFilterOperator.GTE,
          value: ["3"],
        },
        {
          field: BookCriteriaField.AVAILABLE,
          operator: CriteriaFilterOperator.EQUAL,
          value: ["true"],
        },
      ],
    } as CriteriaRequest);

    const [copies] = criteria.find(BookCriteriaField.COPIES);
    const [available] = criteria.find(BookCriteriaField.AVAILABLE);

    expect(copies).toBeInstanceOf(CriteriaNumberFilter);
    expect((copies as CriteriaNumberFilter).numbers()).toEqual([3]);

    expect(available).toBeInstanceOf(CriteriaBooleanFilter);
    expect((available as CriteriaBooleanFilter).value).toBe(true);
  });

  it("caps pageSize and defaults the page, whatever the request says", () => {
    const criteria = map({ pageSize: 5_000 } as CriteriaRequest);

    expect(criteria.pageSize).toBe(MAX_PAGE_SIZE);
    expect(criteria.page).toBe(1);
  });

  it("always sets a page size, so a criteria never means an unbounded query", () => {
    const criteria = map({} as CriteriaRequest);

    expect(criteria.pageSize).not.toBeNull();
  });

  it("reads a blank search as no search", () => {
    const criteria = map({ search: "   " } as CriteriaRequest);

    expect(criteria.search).toBeNull();
  });

  it("keeps the default order when the request brings none", () => {
    const criteria = map(
      {} as CriteriaRequest,
      new BookCriteria({
        order: new CriteriaOrder({
          orderBy: BookCriteriaField.PUBLISHED_AT,
          orderType: CriteriaOrderType.DESC,
        }),
      }),
    );

    expect(criteria.order?.orderBy).toBe(BookCriteriaField.PUBLISHED_AT);
  });

  it("lets the request override the default order", () => {
    const criteria = map(
      {
        order: { by: BookCriteriaField.TITLE, type: CriteriaOrderType.ASC },
      } as CriteriaRequest,
      new BookCriteria({
        order: new CriteriaOrder({
          orderBy: BookCriteriaField.PUBLISHED_AT,
          orderType: CriteriaOrderType.DESC,
        }),
      }),
    );

    expect(criteria.order?.orderBy).toBe(BookCriteriaField.TITLE);
    expect(criteria.order?.orderType).toBe(CriteriaOrderType.ASC);
  });

  it("drops a boolean filter whose value was neither true nor false", () => {
    const criteria = map({
      filters: [
        {
          field: BookCriteriaField.AVAILABLE,
          operator: CriteriaFilterOperator.EQUAL,
          value: ["yes"],
        },
      ],
    } as CriteriaRequest);

    expect(criteria.filters).toHaveLength(0);
  });
});
