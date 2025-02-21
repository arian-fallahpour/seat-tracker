const express = require("express");
const courseController = require("../controllers/courseController");

const router = express.Router();

router.get("/search/:school", courseController.searchForCourses);
router.get("/info/:school/:slug", courseController.getCourseInfo);

router.route("/").get(courseController.getAllCourses).post(courseController.createOneCourse);
router
  .route("/:id")
  .get(courseController.getOneCourse)
  .patch(courseController.updateOneCourse)
  .delete(courseController.deleteOneCourse);

router.route;

module.exports = router;
