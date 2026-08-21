import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BookModule } from "./book/infrastructure/nest/book.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URL ?? "mongodb://localhost:27017/criteria-example",
    ),
    BookModule,
  ],
})
export class AppModule {}
