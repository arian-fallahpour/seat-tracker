const express = require("express");

const orderController = require("../controllers/orderController");
const webhookController = require("../controllers/webhookController");
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authcontroller");

const router = express.Router();

router.post("/webhooks", webhookController.handleWebhooks);

router.post("/create-checkout-session", orderController.createCheckoutSession);

// DEV ONLY ROUTES
router.use(authController.restrictToDevOnly);

router.route("/").get(orderController.getAllOrders).post(orderController.createOneOrder);
router
  .route("/:id")
  .get(orderController.getOneOrder)
  .patch(orderController.updateOneOrder)
  .delete(orderController.deleteOneOrder);

module.exports = router;
