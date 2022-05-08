import express = require("express");
import { ObjectId } from "mongoose";
import Post from "../db/models/post.models";
import User from "../db/models/user.models";

const router = express.Router();

router.post("/", async (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({
      message: "Please log in first",
    });
  }
  const userid = req.user?.uid;
  if (
    (!req.body.content && req.body.images.length === 0) ||
    req.body.content.length > 500
  ) {
    return res.status(400).json({
      message: "Content must be between 1 and 500 characters",
    });
  }
  const post = {
    content: req.body.content,
    imagePath: req.body.images,
  };
  try {
    if (userid) {
      const newPost = await Post.addPost(userid, post);
      return res.status(200).json({
        message: "Post added successfully",
        post: newPost,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({
      message: "Please log in first",
    });
  }
  const uid = req.user?.uid || "";
  const author = req.query.author || "";
  try {
    const user = await User.findById(uid).select("following");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const userIds = user.following || [];
    userIds.push(<ObjectId>(<unknown>uid));
    const posts = await Post.getPosts(userIds, author as string);
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({
      message: "Please log in first",
    });
  }
  const id = req.params.id;
  try {
    const post = await Post.findById(id)
      .populate("author", "username firstName lastName avatar")
      .populate("comments.author", "username firstName lastName avatar");
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    return res.status(200).json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.patch("/:postId/comment", (req, res) => {
  if (req.isUnauthenticated())
    return res.status(401).json({
      message: "You must be logged in to comment",
    });

  const userId = req.user?.uid;
  const postId = req.params.postId;
  const content = req.body.content;
  if (!userId || !postId || !content)
    return res.status(400).json({
      message: "Missing required fields",
    });
  Post.addComment(postId, userId, content)
    .then((post) => {
      if (!post)
        return res.status(404).json({
          message: "Post not found",
        });
      res.status(200).json({
        message: "Comment added",
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.patch("/:postId/like", (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({
      message: "You must be logged in first",
    });
  }
  const userId = req.user?.uid;
  const postId = req.params.postId;

  if (!userId || !postId)
    return res.status(400).json({
      message: "Missing required fields",
    });
  Post.likePost(postId, userId)
    .then(() => {
      res.status(200).json({
        message: "Liked successful",
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.patch("/:postId/unlike", (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({
      message: "You must be logged in first",
    });
  }
  const userId = req.user?.uid;
  const postId = req.params.postId;

  if (!userId || !postId)
    return res.status(400).json({
      message: "Missing required fields",
    });
  Post.unlikePost(postId, userId)
    .then(() => {
      res.status(200).json({
        message: "Unliked successful",
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

export = router;
