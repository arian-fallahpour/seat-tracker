import express from "express";

import * as alertController from "../controllers/alertController";
import * as authController from "../controllers/authcontroller";

const router = express.Router();

router.get("/count", alertController.getAlertsCount);
router.route("/info/:id").get(alertController.getAlertInfo).post(alertController.editAlertInfo);
router.post("/verify", alertController.verifyAlert);

// DEV ONLY ROUTES
router.use(authController.restrictToDevOnly);

router.route("/").get(alertController.getAllAlerts).post(alertController.createOneAlert);
router
  .route("/:id")
  .get(alertController.getOneAlert)
  .patch(alertController.updateOneAlert)
  .delete(alertController.deleteOneAlert);

export default router;
