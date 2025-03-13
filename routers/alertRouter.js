const express = require("express");
const alertController = require("../controllers/alertController");

const router = express.Router();

router.route("/info/:id").get(alertController.getAlertInfo).post(alertController.editAlertInfo);

router.route("/").get(alertController.getAllAlerts).post(alertController.createOneAlert);
router
  .route("/:id")
  .get(alertController.getOneAlert)
  .patch(alertController.updateOneAlert)
  .delete(alertController.deleteOneAlert);

module.exports = router;
