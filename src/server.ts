import dotenv = require("dotenv");
dotenv.config();

import express = require("express");
const app = express();

import middleware from "./middleware";

// 注册中间件
middleware(app);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

// module.exports = app;
