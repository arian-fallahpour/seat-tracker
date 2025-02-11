const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  alert: {
    type: mongoose.Schema.ObjectId,
    ref: "alert",
    required: [true, "Order must be associated with an alert."],
  },
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
    immutable: [true, "You cannot change the creation date."],
  },
  stripeTransactionId: {
    type: String,
    required: [true, "Please provide a stripe transaction id"],
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
