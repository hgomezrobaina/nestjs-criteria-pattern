import { Book } from "@book/domain/core/book.entity";
import { BookResponse } from "../dto/book";

export class BookMapper {
  // `acquisitionPrice` is not here either: the field is internal at every layer.
  static execute(book: Book): BookResponse {
    return {
      id: book.id,
      title: book.title,
      authorName: book.authorName,
      publishedAt: book.publishedAt.toISOString(),
      copies: book.copies,
      available: book.available,
    };
  }
}
