import express = require("express");
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
  try {
    const user = await User.findById(uid).select("following");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const userIds = user.following?.map((follow) => follow.toString()) || [];
    userIds.push(uid);
    const posts = await Post.getPosts(userIds);
    return res.status(200).json(posts);
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

export = router;
