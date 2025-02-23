const Alert = require("../models/database/Alert");

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
    fulfillCheckout(event.data.object.id);
  }

  res.status(200).end();
};

async function fulfillCheckout(sessionId) {
  // TODO: Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // TODO: Make sure fulfillment hasn't already been
  // peformed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  console.log("CheckoutSession: ", checkoutSession);

  const { metadata } = checkoutSession;

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be peformed
  if (checkoutSession.payment_status !== "unpaid") {
    const alertId = checkoutSession.metadata.alert;

    const alert = await Alert.findById(alertId);
    if (alert.status === "active") return;

    // TODO: Send confirmation email
    await alert.activateAlert();

    // TODO: Record/save fulfillment status for this
    // Checkout Session
  }
}

// TODO: review docs to make sure doing best practices
