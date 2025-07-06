const crudController = require("./crudController");
const OrderModel = require("../models/OrderModel");
const AlertModel = require("../models/AlertModel");
const catchAsync = require("../utils/app/catchAsync");
const AppError = require("../utils/app/AppError");
const businessData = require("../data/business-data");
const UoftCourseModel = require("../models/Course/UoftCourseModel");
const alertsData = require("../data/alerts-data");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { email, course: courseId, sections } = req.body;

  // Validate required input
  if (!email) return next(new AppError("Please provide an email for this alert.", 400));
  if (!courseId) return next(new AppError("Please provide a course for this alert.", 400));

  // Find course and make sure it is enrollable
  const course = await UoftCourseModel.findById(courseId);
  if (!course) {
    return next(new AppError("Could not find specified course.", 404));
  } else if (!course.isEnrollable()) {
    return next(new AppError("This course is not enrollable at this time", 400));
  }

  // Handle alert creation or update
  let alert = await AlertModel.findOne({
    email,
    course: courseId,
    status: ["processing", "active"],
  }).sort({ createdAt: -1 });
  if (!alert) {
    alert = await AlertModel.create({ email, course: courseId, sections });
  } else if (alert.verificationCode && new Date(Date.now()) < alert.verificationExpiresAt) {
    return next(new AppError("Please verify the alert sent to your inbox.", 400));
  } else if (alert.status === "processing") {
    alert.sections = sections;
    await alert.save();
  } else {
    const message = `You already have an alert that is ${alert.status} for this course.`;
    return next(new AppError(message, 400));
  }

  // If the alert is free, activate it immediately
  if (alertsData.alertPriceCAD === 0) {
    return createFreeAlert(res, next, alert);
  }

  // Otherwise, create a checkout session
  return createCheckoutSession(req, res, course, alert);
});

async function createFreeAlert(res, next, alert) {
  // Check if user with email already created the maximum number of alerts in the cooldown period
  const recentlyActivatedAlerts = await AlertModel.find({
    email: alert.email,
    status: "active",
    createdAt: {
      $gte: new Date(Date.now() - alertsData.alertCreationCooldownDays * 24 * 60 * 60 * 1000),
    },
  });

  if (recentlyActivatedAlerts.length >= alertsData.alertCreationCooldownCount)
    return next(
      new AppError(
        `You already created ${alertsData.alertCreationCooldownCount} alerts today. Please try again ${alertsData.alertCreationCooldownDays === 1 ? "tomorrow" : `in ${alertsData.alertCreationCooldownDays} days`}.`,
        400
      )
    );

  // Create verification code and send it to the user
  await alert.createVerificationCode();

  // Return checkout page url
  return res.status(200).json({
    status: "success",
    message: "Verification code sent to email. Please check your inbox.",
    data: {
      type: "verification",
    },
  });
}

async function createCheckoutSession(req, res, course, alert) {
  // Find or created order for this alert
  let order = await OrderModel.findOne({ alert: alert.id });
  if (!order) {
    order = await OrderModel.create({ alert: alert.id });
  } else if (order.isFulfilled) {
    return next(new AppError("Order has already been fulfill.", 400));
  }

  // Generate success and cancel urls
  const protocol = req.protocol;
  const host =
    process.env.NODE_ENV === "development" ? `localhost:${process.env.PORT}` : req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  // Generate success and cancel messages
  const successMessage = `You will now get alerts for ${course.code}. Check your inbox!`;
  const cancelMessage = "Could not complete transaction.";

  // Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "CAD",
          product_data: {
            name: `Alerts for ${course.code}`,
            description: `Set up alerts for ${course.name} (${course.code}) that notify you when a selected section is no longer full.`,
          },
          unit_amount: alertsData.alertPriceCAD * 100,
        },
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    metadata: { alert: alert.id, order: order.id },
    mode: "payment",
    success_url: `${baseUrl}/?success=${encodeURIComponent(successMessage)}`,
    cancel_url: `${baseUrl}/?error=${encodeURIComponent(cancelMessage)}`,
  });

  // Save stripe session id to order
  order.stripeSessionId = session.id;
  await order.save();

  // Return checkout page url
  return res.status(200).json({
    status: "success",
    message: "Checkout session created. Please complete the payment.",
    data: {
      type: "checkout",
      stripeSessionUrl: session.url,
    },
  });
}

exports.getOneOrder = crudController.getOne(OrderModel);
exports.getAllOrders = crudController.getAll(OrderModel);
exports.createOneOrder = crudController.createOne(OrderModel);
exports.updateOneOrder = crudController.updateOne(OrderModel);
exports.deleteOneOrder = crudController.deleteOne(OrderModel);
