import express from "express";

import * as orderController from "../controllers/orderController";
import * as webhookController from "../controllers/webhookController";
import * as authController from "../controllers/authcontroller";

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

export default router;
