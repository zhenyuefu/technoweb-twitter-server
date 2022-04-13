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
    
    const newUser = await User.create({
      username,
      password,
      email,
      firstName,
      lastName,
    });
    req.login({
      uid: String(newUser._id),
      username: newUser.username,
    }, (err) => {
      console.log(err);
    });
    return res.status(201).json({
      message: "User created successful !",
      user:newUser});
  } catch (error:any) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.send({
      uid: req.user.uid,
      username: req.user.username,
    });
  }
  return res.status(401).json({ message: "Unauthorized" });
});

router.get("/username", async (req, res) => {
  try {
  const name = req.query.username;
  const user = await User.findOne({ username: name });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  return res.status(200).json({
    message: "User exists"
  });
  } catch (error:any) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/email", async (req, res) => {
  try {
  const email = req.query.email;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  return res.status(200).json({
    message: "This email is already registered"
  });
  } catch (error:any) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

export = router;
