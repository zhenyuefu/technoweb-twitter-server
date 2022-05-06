import express = require("express");
import userRouter from "./user";
import authRouter from "./auth";
import postRouter from "./post";
import searchRouter from "./search";

const routes: (app: express.Application) => void = (app) => {
  app.all("/api", (req, res) => {
    // res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  });
  app.use("/api/user", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/post", postRouter);
  app.use("/api/search", searchRouter);
};

export = routes;
