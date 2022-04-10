import mongoose = require("../db");
import bcrypt = require("bcrypt");

interface IUser {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  updatedAt?: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
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
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User: mongoose.Model<IUser> = mongoose.model("User", UserSchema);

export = User;
