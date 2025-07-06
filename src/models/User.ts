import mongoose, { Document, Types, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  password: string;
  email: string;
  confirmed: boolean;
}

const userSchema : Schema = new Schema({
  name: {
    required: true,
    trim: true,
    type: String
  },

  password: {
    required: true,
    type: String
  },

  email: {
    required: true,
    type: String,
    trim: true,
    unique: true,
    lowercase: true
  },

  confirmed: {
    type: Boolean,
    default: false
  },

}, {timestamps: true});

const User = mongoose.model<IUser>('User', userSchema);

export default User;