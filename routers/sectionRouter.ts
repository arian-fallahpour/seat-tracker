import express from "express";

import * as sectionController from "../controllers/sectionController";
import * as authController from "../controllers/authcontroller";

const router = express.Router();

// DEV ONLY ROUTES
router.use(authController.restrictToDevOnly);

router.route("/").get(sectionController.getAllSections).post(sectionController.createOneSection);
router
  .route("/:id")
  .get(sectionController.getOneSection)
  .patch(sectionController.updateOneSection)
  .delete(sectionController.deleteOneSection);

export default router;
