import { OrderType } from "@/Types/ModelTypes";
import mongoose, { Model, Schema } from "mongoose";

const orderSchema = new Schema<OrderType>({
  alert: {
    type: Schema.ObjectId,
    ref: "alert",
    required: [true, "Order must be associated with an alert."],
  },
  isFulfilled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeSessionId: String,
  stripePaymentId: String,
  stripePromotionIds: {
    type: [String],
    default: [],
  },
});

orderSchema.methods.fulfill = async function (
  stripePaymentId: string,
  stripePromotionIds: string,
): Promise<void> {
  this.stripePaymentId = stripePaymentId;
  this.stripePromotionIds = stripePromotionIds;
  this.isFulfilled = true;
  await this.save();
};

const OrderModel = mongoose.models?.Order || mongoose.model("Order", orderSchema);

export default OrderModel as Model<OrderType>;
