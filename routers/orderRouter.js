const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router
  .route("/")
  .get(orderController.getAllOrders)
  .post(orderController.createOneOrder);
router
  .route("/:id")
  .get(orderController.getOneOrder)
  .patch(orderController.updateOneOrder)
  .delete(orderController.deleteOneOrder);

module.exports = router;
