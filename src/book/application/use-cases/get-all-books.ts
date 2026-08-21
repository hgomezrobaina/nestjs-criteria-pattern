import { CriteriaOrder } from "@shared/domain/criteria/criteria-order";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";
import { PaginationResponse } from "@shared/application/dto/pagination";
import { PaginationResponseMapper } from "@shared/application/pagination/pagination-response-mapper";
import type { CriteriaRequest } from "@shared/application/dto/criteria-request";
import { BookRepository } from "@book/domain/repository/book.repository";
import { BookCriteria } from "@book/domain/criteria/book-criteria";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";
import { BookCriteriaRequestMapper } from "../criteria/book-criteria-request-mapper";
import { BookMapper } from "../services/book-mapper";
import { BookResponse } from "../dto/book";

interface Props {
  request: CriteriaRequest;
}

export class GetAllBooks {
  constructor(
    private readonly repository: BookRepository,
    private readonly criteriaMapper: BookCriteriaRequestMapper,
  ) {}

  async execute({ request }: Props): Promise<PaginationResponse<BookResponse>> {
    const criteria = this.criteriaMapper.execute({
      // The default order is a product decision —what the reader sees first— not a
      // transport one, so it is built here and the request overrides it if it brings
      // its own `order`.
      criteria: new BookCriteria({
        order: new CriteriaOrder({
          orderBy: BookCriteriaField.PUBLISHED_AT,
          orderType: CriteriaOrderType.DESC,
        }),
      }),
      request: request,
    });

    const result = await this.repository.pagination(criteria);

    return PaginationResponseMapper.execute({
      result: {
        ...result,
        items: result.items.map((b) => BookMapper.execute(b)),
      },
    });
  }
}
