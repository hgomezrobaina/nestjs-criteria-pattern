/* eslint-disable no-console */
const mongoose = require("mongoose");

// Plain JS on purpose: seeding is a one-off chore and this way the example needs no
// TypeScript runner as a dependency.
const AuthorSchema = new mongoose.Schema(
  { _id: String, name: { type: String, required: true } },
  { collection: "authors", timestamps: true },
);

const BookSchema = new mongoose.Schema(
  {
    _id: String,
    title: { type: String, required: true },
    author: { type: String, ref: "MongoAuthor", required: true },
    publishedAt: { type: Date, required: true },
    copies: { type: Number, required: true },
    available: { type: Boolean, required: true },
    acquisitionPrice: { type: Number, required: true },
  },
  { collection: "books", timestamps: true },
);

const AUTHORS = [
  { _id: "author-1", name: "Frank Herbert" },
  { _id: "author-2", name: "Ursula K. Le Guin" },
  { _id: "author-3", name: "Octavia E. Butler" },
];

const TITLES = [
  "Dune",
  "Dune Messiah",
  "Children of Dune",
  "A Wizard of Earthsea",
  "The Left Hand of Darkness",
  "The Dispossessed",
  "Kindred",
  "Parable of the Sower",
  "Wild Seed",
  "Dawn",
];

async function seed() {
  const url =
    process.env.MONGO_URL || "mongodb://localhost:27017/criteria-example";

  await mongoose.connect(url);

  const Author = mongoose.model("MongoAuthor", AuthorSchema);
  const Book = mongoose.model("MongoBook", BookSchema);

  await Author.deleteMany({});
  await Book.deleteMany({});

  await Author.insertMany(AUTHORS);

  await Book.insertMany(
    TITLES.map((title, i) => ({
      _id: `book-${i + 1}`,
      title: title,
      author: AUTHORS[i % AUTHORS.length]._id,
      publishedAt: new Date(Date.UTC(1965 + i, 0, 1)),
      copies: (i % 5) + 1,
      available: i % 4 !== 0,
      acquisitionPrice: 10 + i,
    })),
  );

  console.log(`seeded ${AUTHORS.length} authors and ${TITLES.length} books`);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
