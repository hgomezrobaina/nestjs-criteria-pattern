# The Criteria pattern in NestJS

A runnable companion to the article *[El patrón Criteria en NestJS](#)* — one contract to
filter, sort and paginate any list, expressed in the vocabulary of the domain and translated
twice: once at the HTTP border, once at the database border.

The example domain is a library catalogue. A book stores a reference to its author, so the
author's **name** lives in another collection — which is the case that decides whether this
pattern survives contact with a real list.

## Run it

```bash
docker compose up -d
npm install
npm run seed
npm run dev
```

Then:

```
GET http://localhost:3000/books
  ?filters[0][field]=title&filters[0][operator]=CONTAINS&filters[0][value][0]=dune
  &filters[1][field]=authorName&filters[1][operator]=EQUAL&filters[1][value][0]=Frank%20Herbert
  &order[by]=publishedAt&order[type]=DESC
  &page=1&pageSize=5
```

```json
{ "items": [], "totalItems": 3, "totalPages": 1, "pageSize": 5 }
```

Note there is not a single column name in the controller, and that `authorName` filters and
sorts like any other column even though no book document has such a property.

## The tests

**26 tests, 19 ms, no database.** Measured with `npm test` on vitest 2.1.9 — 19 ms of test
execution inside a ~610 ms wall clock that is almost entirely vitest starting up.

They are the point of the design, not a checkbox: filters, operators, page ceilings, the
public-name-to-column map and both engine translators are all exercised against plain objects.
The database is needed to *run* the app, never to test what it decides.

```bash
npm test
npm run typecheck
```

## What lives where

```
src/
├── shared/
│   ├── domain/criteria/            the criteria and its typed filters — imports nothing
│   ├── domain/constants/           operators, filter types, page ceiling
│   ├── application/dto/            the only file with decorators: the HTTP border
│   ├── application/criteria/       translation 1: request -> criteria
│   ├── infrastructure/mongo/       translation 2a: criteria -> mongo pieces
│   └── infrastructure/typeorm/     translation 2b: criteria -> SQL pieces
└── book/
    ├── domain/criteria/            the public field enum: the whole API surface
    ├── domain/repository/          pagination(criteria) and nothing else
    ├── application/                the field types, the use case, the response mapper
    └── infrastructure/             the field map, the aggregation, the controller
```

Four files are specific to a list — the enum, the one-line criteria, the request mapper's
`options()` and the infrastructure field map. Everything else is shared by every list in the
project.

## Two things worth opening

**`src/shared/infrastructure/mongo/mongo-criteria-builder.ts`** returns `filter`, `order`,
`skip` and `limit` separately instead of a built query. That is what lets
`book-mongo-repository.ts` feed those same pieces into an `aggregate()` with a `$lookup`
before the `$match`, so a field from another collection is filtered and sorted like any other.

**`src/shared/infrastructure/typeorm/typeorm-criteria-builder.ts`** is the same input
producing `where`, `order`, `skip` and `take`. Porting a whole list to SQL is that file plus a
field map: the enum, the criteria, the DTO, the request mapper and the use case do not change.
`__test__/typeorm-criteria-builder.spec.ts` runs it without a database to prove it.

## License

MIT.
