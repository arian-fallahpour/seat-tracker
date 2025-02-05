const express = require("express");
const courseController = require("../controllers/courseController");

const router = express.Router();

router
  .route("/")
  .get(courseController.getAllCourses)
  .post(courseController.createOneCourse);
router
  .route("/:id")
  .get(courseController.getOneCourse)
  .patch(courseController.updateOneCourse)
  .delete(courseController.deleteOneCourse);

module.exports = router;
