import express = require("express");
import User from "../db/models/user.models";
import Post from "../db/models/post.models";

const router = express.Router();

router.get("/", async (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({
      message: "You are not logged in",
    });
  }
  const text = req.query.text;
  if (!text) {
    return res.status(422).json({
      message: "No text provided",
    });
  }
  try {
    const reg = new RegExp(text as string, "i");
    const users = await User.find({
      $or: [
        { username: { $regex: reg } },
        { firstName: { $regex: reg } },
        { lastName: { $regex: reg } },
      ],
    }).select("username avatar firstName lastName");
    const posts = await Post.find({
      $text: { $search: text as string },
    })
      .populate("author", "username avatar firstName lastName")
      .populate("comments.author", "username avatar firstName lastName");
    return res.status(200).json({
      users,
      posts,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong while searching", error });
  }
});

export default router;
