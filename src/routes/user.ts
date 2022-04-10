import express = require("express");
import User from "../db/models/user.models";
const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;
  if (!username || !password || !email) {
    return res.status(422).json({
      message: "username, password, email are required",
    });
  }
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(422).json({
        message: "username already exists",
      });
    }
    const newUser = await User.create({
      username,
      password,
      email,
      firstName,
      lastName,
    });
    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export = router;
