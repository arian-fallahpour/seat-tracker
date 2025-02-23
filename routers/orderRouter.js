const express = require("express");

const orderController = require("../controllers/orderController");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

router.post("/create-checkout-session", orderController.createCheckoutSession);

router.post("/webhooks", webhookController.handleWebhooks);

router.route("/").get(orderController.getAllOrders).post(orderController.createOneOrder);
router
  .route("/:id")
  .get(orderController.getOneOrder)
  .patch(orderController.updateOneOrder)
  .delete(orderController.deleteOneOrder);

module.exports = router;
