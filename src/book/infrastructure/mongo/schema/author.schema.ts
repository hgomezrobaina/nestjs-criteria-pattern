import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ collection: "authors", timestamps: true })
export class MongoAuthor {
  @Prop({ type: String })
  _id!: string;

  @Prop({ type: String, required: true })
  name!: string;
}

export type AuthorDocument = HydratedDocument<MongoAuthor>;

export const AuthorSchema = SchemaFactory.createForClass(MongoAuthor);
