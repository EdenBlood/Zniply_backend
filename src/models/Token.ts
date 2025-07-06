import mongoose, { Document, Types, Schema } from 'mongoose'

export interface IToken extends Document {
  _id: Types.ObjectId;
  token: string;
  user: Types.ObjectId;
  createdAt: Date
}

const tokenSchema : Schema = new Schema({
  token: {
    type: String,
    required: true
  },

  user: {
    ref: 'User',
    type: Types.ObjectId,
  },

  expiresAt: {
    type: Date,
    default: Date.now(),
    expires: "120m"
  }
})

const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;