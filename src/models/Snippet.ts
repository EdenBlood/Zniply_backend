import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISnippet extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  code: string;
  user: Types.ObjectId;
};

const snippetSchema: Schema = new Schema({
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
    ref: 'User',
  }
}, {timestamps: true})

const Snippet = mongoose.model<ISnippet>('Snippet', snippetSchema)

export default Snippet;