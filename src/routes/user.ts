/* eslint-disable @typescript-eslint/no-explicit-any */
import express = require("express");
import User from "../db/models/user.models";

const router = express.Router();

router.post("/", async (req, res, next) => {
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
    req.login(
      {
        uid: newUser._id.toString(),
        username: newUser.username,
      },
      function (err) {
        if (err) {
          return next(err);
        }
        return res.status(201).json({
          message: "User created successful !",
          username: newUser.username,
          uid: String(newUser._id),
        });
      }
    );
  } catch (error: any) {
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

router.get("/profile", async (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const username = req.query.username;
    const uid = req.query.uid;

    const user = await User.findOne({
      $or: [{ username: username }, { _id: uid }],
    }).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "success",
      user: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

router.patch("/profile", async (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const uid = req.user?.uid;
  const { avatar, bgPicture, introduction } = req.body;
  let updateBlock = {};
  if (avatar) {
    updateBlock = { ...updateBlock, avatar };
  }
  if (bgPicture) {
    updateBlock = { ...updateBlock, bgPicture };
  }
  if (introduction) {
    updateBlock = { ...updateBlock, introduction };
  }
  if (Object.keys(updateBlock).length === 0) {
    return res.status(422).json({
      message: "No update data",
    });
  }
  try {
    const user = await User.findByIdAndUpdate(
      uid,
      {
        $set: updateBlock,
      },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "success",
      user: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/username", async (req, res) => {
  try {
    const name = req.query.username;
    const user = await User.findOne({ username: name });
    if (!user) {
      return res.status(200).json({
        exists: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      exists: true,
      message: "This username is exists",
    });
  } catch (error: any) {
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
      return res.status(200).json({
        exists: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      exists: true,
      message: "This email is already registered",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

router.patch("/follow/:uid", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { uid: followId } = req.params;
  const userId = req.user.uid;
  if (!followId || !userId) {
    return res.status(422).json({
      message: "uid missing",
    });
  }
  if (followId === userId) {
    return res.status(422).json({
      message: "You can't follow yourself",
    });
  }
  const session = await User.startSession();
  try {
    session.startTransaction();
    const opt = { session, new: true };
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { following: followId } },
      opt
    );
    const follower = await User.findByIdAndUpdate(
      followId,
      { $addToSet: { followers: userId } },
      opt
    );
    if (!user || !follower) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({
        message: "User not found",
      });
    }
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({
      message: "success",
      success: true,
    });
  } catch (error: any) {
    await session.abortTransaction();
    return res.status(500).json({
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
});

router.patch("/unfollow/:uid", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { uid: followId } = req.params;
  const userId = req.user.uid;
  if (!followId || !userId) {
    return res.status(422).json({
      message: "uid missing",
    });
  }
  if (followId === userId) {
    return res.status(422).json({
      message: "You can't unfollow yourself",
    });
  }
  const session = await User.startSession();
  try {
    session.startTransaction();
    const opt = { session, new: true };
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { following: followId } },
      opt
    );
    const follower = await User.findByIdAndUpdate(
      followId,
      { $pull: { followers: userId } },
      opt
    );
    if (!user || !follower) {
      await session.abortTransaction();
      await session.endSession();
      return res.status(404).json({
        message: "User not found",
      });
    }
    await session.commitTransaction();
    await session.endSession();
    return res.status(200).json({
      message: "success",
      success: true,
    });
  } catch (error: any) {
    await session.abortTransaction();
    return res.status(500).json({
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
});

export = router;
