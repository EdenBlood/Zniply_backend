import mongoose, { Schema, Types, Document } from "mongoose";

export interface ILike extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  snippet: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema: Schema = new Schema(
  {
    user: {
      ref: "User",
      type: Types.ObjectId,
      required: true,
    },

    snippet: {
      ref: "Snippet",
      type: Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

// Hace que un mismo usuario no le pueda dar más de 1 like a un mismo snippet.
likeSchema.index({ user: 1, snippet: 1 }, { unique: true });

const Like = mongoose.model<ILike>("Like", likeSchema);

export default Like;
