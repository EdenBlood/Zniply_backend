import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISnippet extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  code: string;
  user: Types.ObjectId;
  language: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const snippetSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
    },

    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    likeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Snippet = mongoose.model<ISnippet>("Snippet", snippetSchema);

export default Snippet;
