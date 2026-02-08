import express from "express";

import * as courseController from "../controllers/courseController";
import * as authController from "../controllers/authcontroller";

const router = express.Router();

router.get("/search", courseController.searchForCourses);
router.get("/info/:slug", courseController.getCourseInfo);

// DEV ONLY ROUTES
router.use(authController.restrictToDevOnly);

router.route("/").get(courseController.getAllCourses).post(courseController.createOneCourse);
router
  .route("/:id")
  .get(courseController.getOneCourse)
  .patch(courseController.updateOneCourse)
  .delete(courseController.deleteOneCourse);

router.route;

export default router;
