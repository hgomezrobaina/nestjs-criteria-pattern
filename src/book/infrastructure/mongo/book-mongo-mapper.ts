import { Book } from "@book/domain/core/book.entity";

/** The shape a joined row has: `author` is the whole document after the `$lookup`. */
export type JoinedBook = {
  _id: string;
  title: string;
  author: { _id: string; name: string };
  publishedAt: Date;
  copies: number;
  available: boolean;
  acquisitionPrice: number;
};

export class BookMongoMapper {
  static execute(raw: JoinedBook): Book {
    return new Book({
      id: raw._id,
      title: raw.title,
      authorName: raw.author.name,
      publishedAt: raw.publishedAt,
      copies: raw.copies,
      available: raw.available,
      acquisitionPrice: raw.acquisitionPrice,
    });
  }
}
