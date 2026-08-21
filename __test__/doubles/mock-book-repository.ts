import { PaginationRepositoryResult } from "@shared/domain/repository/pagination-repository-result";
import { Book } from "@book/domain/core/book.entity";
import { BookCriteria } from "@book/domain/criteria/book-criteria";
import { BookRepository } from "@book/domain/repository/book.repository";

/**
 * Records the criteria it was handed and returns whatever the test configured. The
 * point of the double is that the use case can be exercised without a database: the
 * criteria IS the boundary.
 */
export class MockBookRepository implements BookRepository {
  private items: Book[] = [];
  private count = 0;

  received: BookCriteria | null = null;

  returns(items: Book[], count: number): void {
    this.items = items;
    this.count = count;
  }

  async pagination(
    criteria: BookCriteria,
  ): Promise<PaginationRepositoryResult<Book>> {
    this.received = criteria;

    return {
      items: this.items,
      count: this.count,
      pageSize: criteria.pageSize,
    };
  }
}
