const OrderModel = require("../models/OrderModel");
const AlertModel = require("../models/AlertModel");
const Logger = require("../utils/Logger");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

  // Handle events based on their type
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      return await fulfillCheckout(res, event.data.object);
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }

  return res.status(200).end();
};

exports.fulfillCheckout = fulfillCheckout;
async function fulfillCheckout(res, eventData) {
  const {
    id: sessionId,
    payment_intent, // May be null if amount === 0
    discounts, // Empty array if no discounts
  } = eventData;

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

  // Check if order exists, or order has been fulfilled already
  const order = await OrderModel.findById(checkoutSession.metadata.order);
  if (!order) {
    const message = "Order not found";
    Logger.error(message, {
      stripeSessionId: sessionId,
      stripePaymentId: payment_intent,
      order: checkoutSession.metadata.order,
      alert: checkoutSession.metadata.alert,
    });
    return res.status(400).send(message);
  } else if (order.isFulfilled) {
    return res.status(400).send("Order already fulfilled");
  }

  // If payment status is unpaid
  if (checkoutSession.payment_status === "unpaid") {
    const message = "Checkout session payment status is unpaid";
    Logger.warn(message, {
      stripeSessionId: sessionId,
      stripePaymentId: payment_intent,
      order: order.id,
      alert: checkoutSession.metadata.alert,
    });
    return res.status(400).send(message);
  }

  // Find alert associated with payment
  const alert = await AlertModel.findById(checkoutSession.metadata.alert);
  if (!alert) {
    const message = "Alert not found";
    Logger.error(message, {
      stripeSessionId: sessionId,
      stripePaymentId: payment_intent,
      order: order.id,
      alert: checkoutSession.metadata.alert,
    });
    return res.status(400).send(message);
  } else if (alert.status !== "processing") {
    return res.status(400).send("Alert was already activated!");
  }

  // Activate alert and send notification
  await alert.activate();

  // Fulfill order
  const stripePromotionIds = discounts.map((discount) => discount.promotion_code);
  await order.fulfill(payment_intent, stripePromotionIds);

  // Return success
  return res.status(200).end();
}

// Fulfillment docs: https://docs.stripe.com/checkout/fulfillment
// Stripe webhooks CLI: stripe listen --forward-to localhost:3000/webhooks
