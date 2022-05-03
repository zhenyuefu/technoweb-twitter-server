import express = require("express");
import Post from "../db/models/post.models";

const router = express.Router();

router.post("/", async (req, res) => {
  if (req.isUnauthenticated()) {
    return res.status(401).json({
      message: "Please log in first",
    });
  }
  const userid = req.user?.uid;
  if (!req.body.content || req.body.content.length > 500) {
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
      })
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

  try {
    const posts = await Post.getPosts(<string>req.user?.uid);
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});


export = router;
