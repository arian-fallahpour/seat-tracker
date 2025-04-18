const express = require("express");

const sectionController = require("../controllers/sectionController");
const authController = require("../controllers/authcontroller");

const router = express.Router();

// DEV ONLY ROUTES
router.use(authController.restrictToDevOnly);

router.route("/").get(sectionController.getAllSections).post(sectionController.createOneSection);
router
  .route("/:id")
  .get(sectionController.getOneSection)
  .patch(sectionController.updateOneSection)
  .delete(sectionController.deleteOneSection);

module.exports = router;
