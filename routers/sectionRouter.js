const express = require("express");
const sectionController = require("../controllers/sectionController");

const router = express.Router();

router
  .route("/")
  .get(sectionController.getAllSections)
  .post(sectionController.createOneSection);
router
  .route("/:id")
  .get(sectionController.getOneSection)
  .patch(sectionController.updateOneSection)
  .delete(sectionController.deleteOneSection);

module.exports = router;
