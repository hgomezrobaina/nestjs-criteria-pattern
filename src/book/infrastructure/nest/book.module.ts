import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoBook, BookSchema } from "../mongo/schema/book.schema";
import { MongoAuthor, AuthorSchema } from "../mongo/schema/author.schema";
import { BookMongoRepository } from "../mongo/book-mongo-repository";
import { BookController } from "./book.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongoBook.name, schema: BookSchema },
      { name: MongoAuthor.name, schema: AuthorSchema },
    ]),
  ],
  controllers: [BookController],
  providers: [BookMongoRepository],
})
export class BookModule {}
