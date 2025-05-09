const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  alert: {
    type: mongoose.Schema.ObjectId,
    ref: "alert",
    required: [true, "Order must be associated with an alert."],
  },
  stripeSessionId: String,
  stripePaymentId: String,
  stripePromotionIds: {
    type: [String],
    default: [],
    required: [true, "Stripe promotion ids must be an array."],
  },
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

orderSchema.methods.fulfill = async function (stripePaymentId, stripePromotionIds) {
  this.stripePaymentId = stripePaymentId;
  this.stripePromotionIds = stripePromotionIds;
  this.isFulfilled = true;
  await this.save();
};

const Order = mongoose.models?.Order || mongoose.model("Order", orderSchema);
module.exports = Order;
