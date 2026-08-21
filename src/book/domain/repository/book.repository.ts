import { PaginationRepositoryResult } from "@shared/domain/repository/pagination-repository-result";
import { Book } from "../core/book.entity";
import { BookCriteria } from "../criteria/book-criteria";

export interface BookRepository {
  pagination(criteria: BookCriteria): Promise<PaginationRepositoryResult<Book>>;
}
