const OrderModel = require("../models/OrderModel");
const AlertModel = require("../models/AlertModel");
const Logger = require("../utils/Logger");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// TODO: Review Webhooks one more time
/**
 * - Make this function safe to run multiple times (May not be needed in this case)
 * - in future, add a checkout.session.async_payment_failed handler to notify for failed payment
 */

exports.handleWebhooks = async (req, res) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"];

  // Construct webhook event
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Stripe Webhook Error: ${err.message}`);
  }

  // Fulfill checkout completion
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    return await fulfillCheckout(res, event.data.object);
  }

  res.status(200).end();
};

exports.fulfillCheckout = fulfillCheckout;
async function fulfillCheckout(res, { id: sessionId, payment_intent }) {
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  const { metadata } = checkoutSession;

  // Check if order exists, or order has been fulfilled already
  const order = await OrderModel.findById(metadata.order);
  if (!order) {
    const message = "Stripe Webhook Error: Order not found";
    Logger.error(message, {
      stripeSessionId: sessionId,
      stripePaymentId: payment_intent,
      order: metadata.order,
      alert: metadata.alert,
    });
    return res.status(400).send(message);
  } else if (order.isFulfilled) {
    return res.status(400).send("Stripe Webhook Error: Order already fulfilled");
  }

  // If payment status is unpaid
  if (checkoutSession.payment_status === "unpaid") {
    const message = "Stripe Webhook Error: Checkout session payment status is unpaid";
    Logger.warn(message, {
      stripeSessionId: sessionId,
      stripePaymentId: payment_intent,
      order: order.id,
      alert: metadata.alert,
    });
    return res.status(400).send(message);
  }

  // Find alert associated with payment
  const alert = await AlertModel.findById(metadata.alert);
  if (!alert) {
    const message = "Stripe Webhook Error: Alert not found";
    Logger.error(message, {
      stripeSessionId: sessionId,
      stripePaymentId: payment_intent,
      order: order.id,
      alert: metadata.alert,
    });
    return res.status(400).send(loggerMessage);
  } else if (alert.status !== "processing") {
    return res.status(400).send("Stripe Webhook Error: Alert was already activated!");
  }

  // Activate alert and send notification
  await alert.activate();

  // Fulfill order
  await order.fulfill(payment_intent);

  // Return success
  return res.status(200).end();
}

// Fulfillment docs: https://docs.stripe.com/checkout/fulfillment
// Stripe webhooks CLI: stripe listen --forward-to localhost:3000/webhooks
