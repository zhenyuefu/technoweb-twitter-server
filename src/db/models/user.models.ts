import mongoose = require("mongoose");
import bcrypt = require("bcrypt");
import uniqueValidator = require("mongoose-unique-validator");

interface IUser {
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
});

UserSchema.plugin(uniqueValidator);

const User: mongoose.Model<IUser> = mongoose.model("User", UserSchema);

export = User;
