import mongoose, { Document, Types, Schema } from "mongoose";

export enum Provider {
  CREDENTIALS = "credentials",
  GOOGLE = "google",
  GITHUB = "github",
}

export type ProviderKey = keyof typeof Provider;

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  password: string;
  email: string;
  confirmed: boolean;
  provider: Provider;
}

const userSchema: Schema = new Schema(
  {
    name: {
      required: true,
      trim: true,
      type: String,
    },

    password: {
      required: false,
      type: String,
    },

    email: {
      required: true,
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },

    confirmed: {
      type: Boolean,
      default: false,
    },

    provider: {
      type: String,
      default: Provider.CREDENTIALS,
      enum: Object.values(Provider),
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
