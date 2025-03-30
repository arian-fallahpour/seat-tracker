import Stripe from "stripe";

import * as crudController from "./crudController.js";
import Order from "../models/database/Order.js";
import Alert from "../models/database/Alert.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import businessData from "../data/business-data.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TODO: Test entire checkout process (including fulfillment) (Create a LONG checklist of potential ways it can go)
export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const { email, course, sections } = req.body;
  if (!email) return next(new AppError("Please provide an email for this alert.", 400));
  if (!course) return next(new AppError("Please provide a course for this alert.", 400));

  let alert = await Alert.findOne({ email, course });

  // Check if alert was already made for the same email and course
  const alreadyHasActiveAlert = alert && alert.status === "active.js";
  if (alreadyHasActiveAlert) {
    return next(new AppError("You already have an alert set up for this course.", 400));
  }

  // Create new alert if none found, or the status is not active nor processing
  const noAlertOrNotProcessingStatus = !alert || alert.status !== "processing.js";
  if (noAlertOrNotProcessingStatus) {
    alert = await Alert.create({ email, course, sections });
  }

  // Create order document
  const order = await Order.create({ alert: alert.id });

  // Generate success and cancel urls
  const protocol = req.protocol;
  const domain =
    process.env.NODE_ENV === "development"
      ? `localhost:${process.env.NEXT_PUBLIC_PORT}`
      : req.headers.host;
  const url = `${protocol}://${domain}`;

  // Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: businessData.stripe.alertPriceID, quantity: 1 }],
    metadata: { alert: alert.id, order: order.id },
    mode: "payment",
    success_url: url,
    cancel_url: url,
  });

  // Update order details
  order.stripeSessionId = session.id;
  await order.save();

  // Return checkout page url
  return res.status(200).json({
    status: "success",
    data: {
      stripeSessionUrl: session.url,
    },
  });
});

export const getOneOrder = crudController.getOne(Order);
export const getAllOrders = crudController.getAll(Order);
export const createOneOrder = crudController.createOne(Order);
export const updateOneOrder = crudController.updateOne(Order);
export const deleteOneOrder = crudController.deleteOne(Order);
