const Order = require("../models/database/Order");
const Alert = require("../models/database/Alert");
const Logger = require("../utils/Logger");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handleWebhooks = async (req, res) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    return fulfillCheckout(res, event.data.object);
  }

  // res.status(200).end();
};

// TODO: Is returning res.status 400 correct?
// TODO: Make this function safe to run multiple times,
// even concurrently, with the same session ID

async function fulfillCheckout(res, { id: sessionId, payment_intent }) {
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  const { metadata } = checkoutSession;

  // Check if order exists, or order has been fulfilled already
  const order = await Order.findById(metadata.order);
  if (!order) {
    const loggerMessage = "Order not found";
    const loggerData = { stripeSessionId: sessionId, stripePaymentId: payment_intent };
    Logger.warning(loggerMessage, loggerData);
    return res.status(400).send(loggerMessage);
  }
  if (order.isFulfilled) return res.status(400).send("Order already fulfilled");

  // If payment status is unpaid
  if (checkoutSession.payment_status === "unpaid") {
    const loggerMessage = "Checkout session payment status is unpaid";
    Logger.warning(loggerMessage, {
      order: order.id,
      stripeSessionId: sessionId,
      stripePaymentId: payment_intent,
    });
    return res.status(400).send(loggerMessage);
  }

  // Find alert associated with payment
  const alert = await Alert.findById(metadata.alert);
  if (alert.status === "active") return res.status(400).send("Alert is already active");

  // Activate alert and send notification
  await alert.activate();

  // Fulfill order
  await order.fulfill(payment_intent);

  return res.status(200).end();
}

// TODO: review docs to make sure doing best practices
// https://docs.stripe.com/checkout/fulfillment
// stripe listen --forward-to localhost:3000/webhooks
