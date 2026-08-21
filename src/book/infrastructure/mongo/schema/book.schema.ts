import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ collection: "books", timestamps: true })
export class MongoBook {
  @Prop({ type: String })
  _id!: string;

  @Prop({ type: String, required: true })
  title!: string;

  // The author's name is NOT here: it lives in `authors`, on the other side of this
  // reference. Filtering and sorting by it is what the aggregation solves.
  @Prop({ type: String, ref: "MongoAuthor", required: true })
  author!: string;

  @Prop({ type: Date, required: true })
  publishedAt!: Date;

  @Prop({ type: Number, required: true })
  copies!: number;

  @Prop({ type: Boolean, required: true })
  available!: boolean;

  @Prop({ type: Number, required: true })
  acquisitionPrice!: number;
}

export type BookDocument = HydratedDocument<MongoBook>;

export const BookSchema = SchemaFactory.createForClass(MongoBook);
