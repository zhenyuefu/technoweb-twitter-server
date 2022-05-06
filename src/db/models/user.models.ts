import mongoose = require("mongoose");
import bcrypt = require("bcrypt");
import uniqueValidator = require("mongoose-unique-validator");
import { ObjectId, Types } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  updatedAt?: Date;
  createAt?: Date;
  avatar?: string;
  introduction?: string;
  bgPicture?: string;
  following?: ObjectId[];
  followers?: ObjectId[];
}

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uniqueCaseInsensitive: true,
  },
  password: {
    type: String,
    required: true,
    set: (password: string) => {
      return bcrypt.hashSync(password, 10);
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    index: true,
  },
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: "",
  },
  introduction: {
    type: String,
    default: "",
  },
  bgPicture: {
    type: String,
    default: "",
  },
  followers: [
    {
      type: Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  following: [
    {
      type: Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
});

UserSchema.plugin(uniqueValidator);

export const User: mongoose.Model<IUser> = mongoose.model("User", UserSchema);

export default User;
