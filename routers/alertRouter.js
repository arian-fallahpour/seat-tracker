const express = require("express");

const alertController = require("../controllers/alertController");
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authcontroller");

const router = express.Router();

router.get("/count", alertController.getAlertsCount);
router.route("/info/:id").get(alertController.getAlertInfo).post(alertController.editAlertInfo);

// DEV ONLY ROUTES
router.use(authController.restrictToDevOnly);

router.route("/").get(alertController.getAllAlerts).post(alertController.createOneAlert);
router
  .route("/:id")
  .get(alertController.getOneAlert)
  .patch(alertController.updateOneAlert)
  .delete(alertController.deleteOneAlert);

module.exports = router;
