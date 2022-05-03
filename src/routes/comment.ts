import express = require("express");
import Post = require("../db/models/post.models");


const router = express.Router();

router.post("/", (req, res) => {
  if (req.isUnauthenticated())
    return res.status(401).json({
      message: "You must be logged in to comment"
    });

  const userId = req.user?.uid;
  const postId = req.body.postId;
  const content = req.body.content;
  if (!userId || !postId || !content)
    return res.status(400).json({
      message: "Missing required fields"
    });
  Post.addComment(postId, userId, content)
    .then((post) => {
      if (!post)
        return res.status(404).json({
          message: "Post not found"
        });
      res.status(200).json({
        message: "Comment added",
      });
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

export = router;