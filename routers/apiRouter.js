const express = require("express");

const alertRouter = require("./alertRouter");
const orderRouter = require("./orderRouter");
const courseRouter = require("./courseRouter");
const sectionRouter = require("./sectionRouter");

const AppError = require("../utils/app/AppError");
const { get404Message } = require("../utils/helper-server");

const router = express.Router();

router.use("/v1/alerts", alertRouter);
router.use("/v1/orders", orderRouter);
router.use("/v1/courses", courseRouter);
router.use("/v1/sections", sectionRouter);

// Route not found
router.all("*", (req, res, next) => {
  return next(new AppError(get404Message(req.originalUrl), 404));
});

module.exports = router;
