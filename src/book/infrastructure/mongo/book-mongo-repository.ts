import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage } from "mongoose";
import { PaginationRepositoryResult } from "@shared/domain/repository/pagination-repository-result";
import { MongoCriteriaBuilder } from "@shared/infrastructure/mongo/mongo-criteria-builder";
import { Book } from "@book/domain/core/book.entity";
import { BookCriteria } from "@book/domain/criteria/book-criteria";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";
import { BookRepository } from "@book/domain/repository/book.repository";
import { MongoBook } from "./schema/book.schema";
import { MongoAuthor } from "./schema/author.schema";
import { BookMongoMapper, JoinedBook } from "./book-mongo-mapper";
import { BOOK_CRITERIA_FIELDS } from "./book-criteria-fields";

@Injectable()
export class BookMongoRepository implements BookRepository {
  private readonly criteriaBuilder = new MongoCriteriaBuilder<BookCriteriaField>();

  constructor(
    @InjectModel(MongoBook.name) private readonly model: Model<MongoBook>,
    @InjectModel(MongoAuthor.name)
    private readonly authorModel: Model<MongoAuthor>,
  ) {}

  async pagination(
    criteria: BookCriteria,
  ): Promise<PaginationRepositoryResult<Book>> {
    const result = this.criteriaBuilder.execute({
      criteria: criteria,
      fields: BOOK_CRITERIA_FIELDS,
    });

    // The author travels on every row, so the lookup goes BEFORE the match: that is
    // the only way `author.name` exists when the filter is evaluated, and the only way
    // it can be sorted by like any other column.
    //
    // The $unwind does NOT preserve empties: a book whose author no longer exists is
    // not a row with a hole, it is a broken reference. It does not show up here.
    const join: PipelineStage[] = [
      {
        $lookup: {
          from: this.authorModel.collection.name,
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      { $match: result.filter },
    ];

    const page: PipelineStage[] = [...join];

    if (result.order !== null) {
      page.push({ $sort: result.order });
    }

    if (result.skip !== null) {
      page.push({ $skip: result.skip });
    }

    if (result.limit !== null) {
      page.push({ $limit: result.limit });
    }

    // Both queries come out of the same filter and travel in parallel; the count
    // carries no skip or limit, because those bound the page and not the total.
    const [list, counted] = await Promise.all([
      this.model.aggregate<JoinedBook>(page),
      this.model.aggregate<{ count: number }>([...join, { $count: "count" }]),
    ]);

    return {
      items: list.map((i) => BookMongoMapper.execute(i)),
      count: counted[0]?.count ?? 0,
      pageSize: criteria.pageSize,
    };
  }
}
