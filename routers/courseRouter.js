const express = require("express");

const courseController = require("../controllers/courseController");
const authController = require("../controllers/authcontroller");

const router = express.Router();

router.get("/search", courseController.restrictEnrol, courseController.searchForCourses);
router.get("/info/:slug", courseController.restrictEnrol, courseController.getCourseInfo);

// DEV ONLY ROUTES
router.use(authController.restrictToDevOnly);

router.route("/").get(courseController.getAllCourses).post(courseController.createOneCourse);
router
  .route("/:id")
  .get(courseController.getOneCourse)
  .patch(courseController.updateOneCourse)
  .delete(courseController.deleteOneCourse);

router.route;

module.exports = router;
