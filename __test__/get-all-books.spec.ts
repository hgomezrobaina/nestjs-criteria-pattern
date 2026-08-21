import { beforeEach, describe, expect, it } from "vitest";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";
import type { CriteriaRequest } from "@shared/application/dto/criteria-request";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";
import { BookCriteriaRequestMapper } from "@book/application/criteria/book-criteria-request-mapper";
import { GetAllBooks } from "@book/application/use-cases/get-all-books";
import { MockBookRepository } from "./doubles/mock-book-repository";
import { BookBuilder } from "./doubles/book-builder";

describe("GetAllBooks", () => {
  let repository: MockBookRepository;
  let useCase: GetAllBooks;

  beforeEach(() => {
    repository = new MockBookRepository();
    useCase = new GetAllBooks(repository, new BookCriteriaRequestMapper());
  });

  it("hands the repository a criteria and nothing else", async () => {
    repository.returns([BookBuilder.build()], 1);

    await useCase.execute({
      request: {
        filters: [
          {
            field: BookCriteriaField.AUTHOR_NAME,
            operator: CriteriaFilterOperator.CONTAINS,
            value: ["Herbert"],
          },
        ],
        pageSize: 20,
      } as CriteriaRequest,
    });

    expect(repository.received?.find(BookCriteriaField.AUTHOR_NAME)).toHaveLength(1);
    expect(repository.received?.pageSize).toBe(20);
  });

  it("applies the default order when the request brings none", async () => {
    repository.returns([], 0);

    await useCase.execute({ request: {} as CriteriaRequest });

    expect(repository.received?.order?.orderBy).toBe(
      BookCriteriaField.PUBLISHED_AT,
    );
    expect(repository.received?.order?.orderType).toBe(CriteriaOrderType.DESC);
  });

  it("counts the pages from the total and the page size", async () => {
    repository.returns([BookBuilder.build()], 143);

    const response = await useCase.execute({
      request: { pageSize: 20 } as CriteriaRequest,
    });

    expect(response.totalItems).toBe(143);
    expect(response.totalPages).toBe(8);
    expect(response.pageSize).toBe(20);
  });

  it("never serialises the internal price", async () => {
    repository.returns([BookBuilder.build()], 1);

    const response = await useCase.execute({ request: {} as CriteriaRequest });

    expect(response.items[0]).not.toHaveProperty("acquisitionPrice");
  });
});
