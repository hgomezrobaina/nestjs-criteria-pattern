import { Controller, Get, Query } from "@nestjs/common";
import { CriteriaRequest } from "@shared/application/dto/criteria-request";
import { PaginationResponse } from "@shared/application/dto/pagination";
import { GetAllBooks } from "@book/application/use-cases/get-all-books";
import { BookCriteriaRequestMapper } from "@book/application/criteria/book-criteria-request-mapper";
import { BookResponse } from "@book/application/dto/book";
import { BookMongoRepository } from "../mongo/book-mongo-repository";

@Controller("books")
export class BookController {
  constructor(private readonly repository: BookMongoRepository) {}

  // Not one column name inside.
  @Get()
  async getAll(
    @Query() request: CriteriaRequest,
  ): Promise<PaginationResponse<BookResponse>> {
    const useCase = new GetAllBooks(
      this.repository,
      new BookCriteriaRequestMapper(),
    );

    return await useCase.execute({ request: request });
  }
}
