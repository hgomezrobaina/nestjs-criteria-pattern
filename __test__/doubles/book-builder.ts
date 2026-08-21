import { Book } from "@book/domain/core/book.entity";

let seq = 0;

export class BookBuilder {
  static build(overrides: Partial<Record<string, unknown>> = {}): Book {
    seq = seq + 1;

    return new Book({
      id: `book-${seq}`,
      title: `Title ${seq}`,
      authorName: "Frank Herbert",
      publishedAt: new Date("1965-08-01T00:00:00.000Z"),
      copies: 3,
      available: true,
      acquisitionPrice: 42,
      ...overrides,
    } as ConstructorParameters<typeof Book>[0]);
  }
}
