import { PaginationRepositoryResult } from "@shared/domain/repository/pagination-repository-result";
import { PaginationResponse } from "../dto/pagination";

interface Props<T> {
  result: PaginationRepositoryResult<T>;
}

export class PaginationResponseMapper {
  static execute<T>({ result }: Props<T>): PaginationResponse<T> {
    // With no pageSize there are no pages to count: everything fits in one.
    const pageSize = result.pageSize ? result.pageSize : result.count;

    return {
      items: result.items,
      totalItems: result.count,
      totalPages: pageSize === 0 ? 0 : Math.ceil(result.count / pageSize),
      pageSize: pageSize,
    };
  }
}
