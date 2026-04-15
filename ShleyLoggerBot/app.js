const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const indexRouter = require("./routes/index.js");

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/", indexRouter);
app.use("/message", indexRouter);

const { rl } = require("./menu.js");

app.use((req, res, next) => {
  res.on("finish", () => {
    rl.prompt(true);
  });
  next();
});

module.exports = app;
