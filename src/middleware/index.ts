// 专门注册中间件

import express = require("express");
import cors = require("cors");
// import path = require("path");
import passport = require("passport");
import session = require("express-session");
// import MongoStore = require("connect-mongo");
import connectRedis = require("connect-redis");
import clientP = require("../db/db");
import redis = require("redis");

const RedisStore = connectRedis(session);

clientP
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const createClient = redis.createClient;
const redisClient = createClient({
  url: process.env.REDIS_URL,
  legacyMode: true,
});
redisClient.connect().catch(console.error);

import routes from "../routes";

const SESSION_SECRET = process.env.SESSION_SECRET || "";
if (!SESSION_SECRET) {
  throw new Error(
    "Please define the SESSION_SECRET environment variable inside .env"
  );
}

export = (app: express.Application) => {
  // CORS跨域
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // 解析请求体数据
  app.use(express.json());

  app.enable("trust proxy");

  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        client: redisClient,
      }),
      proxy: true,
      cookie: {
        // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        // secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      },
    })
  );

  app.use(passport.authenticate("session"));

  // 路由
  routes(app);

  // // 静态文件
  // app.use(express.static(path.join(__dirname, "../../", "dist")));
  // app.get("/*", (req, res) => {
  //   res.sendFile(path.join(__dirname, "../../../", "dist", "/index.html"));
  // });
};
