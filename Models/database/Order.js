const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  alert: {
    type: mongoose.Schema.ObjectId,
    ref: "alert",
    required: [true, "Order must be associated with an alert."],
  },
  stripeSessionId: String,
  stripePaymentId: String,
  isFulfilled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
    immutable: [true, "You cannot change the creation date."],
  },
});

orderSchema.methods.fulfill = async function (stripePaymentId) {
  this.stripePaymentId = stripePaymentId;
  this.isFulfilled = true;
  await this.save();
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
