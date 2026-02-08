import express from "express";

import alertRouter from "./alertRouter";
import orderRouter from "./orderRouter";
import courseRouter from "./courseRouter";
import sectionRouter from "./sectionRouter";

import AppError from "../utils/app/AppError";
import { get404Message } from "../utils/helper-server";

const router = express.Router();

router.use("/alerts", alertRouter);
router.use("/orders", orderRouter);
router.use("/courses", courseRouter);
router.use("/sections", sectionRouter);

// Route not found
router.all(/.*/, (req, res, next) => {
  return next(new AppError(get404Message(req.originalUrl), 404));
});

export default router;
