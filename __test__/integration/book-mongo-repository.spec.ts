import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Model } from "mongoose";
import { CriteriaFilterOperator } from "@shared/domain/constants/criteria-filter-operator";
import { CriteriaOrderType } from "@shared/domain/constants/criteria-order-type";
import { CriteriaOrder } from "@shared/domain/criteria/criteria-order";
import { CriteriaStringFilter } from "@shared/domain/criteria/criteria-string-filter";
import { BookCriteria } from "@book/domain/criteria/book-criteria";
import { BookCriteriaField } from "@book/domain/criteria/book-criteria-field";
import { BookMongoRepository } from "@book/infrastructure/mongo/book-mongo-repository";
import {
  MongoAuthor,
  AuthorSchema,
} from "@book/infrastructure/mongo/schema/author.schema";
import {
  MongoBook,
  BookSchema,
} from "@book/infrastructure/mongo/schema/book.schema";

/**
 * The only test in the project that needs a real engine, and it is here for one claim:
 * that a field living in another collection filters and sorts like any other column,
 * with the criteria untouched.
 *
 * It runs against a real mongod started in-process — no container, no external service.
 */
describe("BookMongoRepository (real mongod)", () => {
  let mongod: MongoMemoryServer;
  let repository: BookMongoRepository;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    await mongoose.connect(mongod.getUri());

    const authorModel = mongoose.model(
      MongoAuthor.name,
      AuthorSchema,
    ) as unknown as Model<MongoAuthor>;

    const bookModel = mongoose.model(
      MongoBook.name,
      BookSchema,
    ) as unknown as Model<MongoBook>;

    await authorModel.insertMany([
      { _id: "author-1", name: "Frank Herbert" },
      { _id: "author-2", name: "Ursula K. Le Guin" },
    ]);

    await bookModel.insertMany([
      {
        _id: "book-1",
        title: "Dune",
        author: "author-1",
        publishedAt: new Date("1965-08-01T00:00:00.000Z"),
        copies: 3,
        available: true,
        acquisitionPrice: 30,
      },
      {
        _id: "book-2",
        title: "Dune Messiah",
        author: "author-1",
        publishedAt: new Date("1969-10-15T00:00:00.000Z"),
        copies: 2,
        available: true,
        acquisitionPrice: 25,
      },
      {
        _id: "book-3",
        title: "A Wizard of Earthsea",
        author: "author-2",
        publishedAt: new Date("1968-11-01T00:00:00.000Z"),
        copies: 5,
        available: true,
        acquisitionPrice: 20,
      },
      {
        // a broken reference: the author no longer exists
        _id: "book-4",
        title: "Orphan",
        author: "author-gone",
        publishedAt: new Date("1970-01-01T00:00:00.000Z"),
        copies: 1,
        available: false,
        acquisitionPrice: 5,
      },
    ]);

    repository = new BookMongoRepository(bookModel, authorModel);
  }, 120_000);

  afterAll(async () => {
    await mongoose.disconnect();

    // The server may never have started —the first run downloads its binary— and an
    // unguarded stop() here hides the real failure behind a TypeError.
    if (mongod !== undefined) {
      await mongod.stop();
    }
  });

  it("filters by a field that lives in another collection", async () => {
    const result = await repository.pagination(
      new BookCriteria({
        filters: [
          new CriteriaStringFilter({
            field: BookCriteriaField.AUTHOR_NAME,
            operator: CriteriaFilterOperator.EQUAL,
            values: ["Frank Herbert"],
          }),
        ],
        page: 1,
        pageSize: 10,
      }),
    );

    expect(result.items.map((b) => b.title).sort()).toEqual([
      "Dune",
      "Dune Messiah",
    ]);
    expect(result.count).toBe(2);
  });

  it("sorts by that same field", async () => {
    const result = await repository.pagination(
      new BookCriteria({
        order: new CriteriaOrder({
          orderBy: BookCriteriaField.AUTHOR_NAME,
          orderType: CriteriaOrderType.ASC,
        }),
        page: 1,
        pageSize: 10,
      }),
    );

    expect(result.items[0].authorName).toBe("Frank Herbert");
    expect(result.items[result.items.length - 1].authorName).toBe(
      "Ursula K. Le Guin",
    );
  });

  it("free-text search reaches the title and the author's name", async () => {
    const byAuthor = await repository.pagination(
      new BookCriteria({ search: "Guin", page: 1, pageSize: 10 }),
    );

    const byTitle = await repository.pagination(
      new BookCriteria({ search: "Messiah", page: 1, pageSize: 10 }),
    );

    expect(byAuthor.items.map((b) => b.title)).toEqual([
      "A Wizard of Earthsea",
    ]);
    expect(byTitle.items.map((b) => b.title)).toEqual(["Dune Messiah"]);
  });

  it("drops rows whose author no longer exists", async () => {
    const result = await repository.pagination(
      new BookCriteria({ page: 1, pageSize: 10 }),
    );

    expect(result.items.map((b) => b.title)).not.toContain("Orphan");
    expect(result.count).toBe(3);
  });

  it("keeps the total honest when the page is smaller than the result", async () => {
    const result = await repository.pagination(
      new BookCriteria({ page: 1, pageSize: 2 }),
    );

    expect(result.items).toHaveLength(2);
    expect(result.count).toBe(3);
  });
});
