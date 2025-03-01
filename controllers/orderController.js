const crudController = require("./crudController");
const Order = require("../models/database/Order");
const catchAsync = require("../utils/catchAsync");
const businessData = require("../data/business-data");
const Alert = require("../models/database/Alert");
const AppError = require("../utils/AppError");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { email, course, sections, school } = req.body;
  if (!email) return next(new AppError("Please provide an email for this alert.", 400));
  if (!course) return next(new AppError("Please provide a course for this alert.", 400));

  let alert = await Alert.findOne({ email, course });

  const alreadyHasActiveAlert = alert && alert.status === "active";
  if (alreadyHasActiveAlert) {
    return next(new AppError("You already have an alert set up for this course.", 400));
  }

  const noAlertOrNotProcessingStatus = !alert || alert.status !== "processing";
  if (noAlertOrNotProcessingStatus) {
    alert = await Alert.create({ email, course, sections, school });
  }

  // Generate success and cancel urls
  const protocol = req.protocol;
  const domain =
    process.env.NODE_ENV === "development"
      ? `localhost:${process.env.NEXT_PUBLIC_PORT}`
      : req.headers.host;
  const url = `${protocol}://${domain}`;

  // Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: businessData.stripe.alertPriceID,
        quantity: 1,
      },
    ],
    metadata: { alert: alert.id },
    mode: "payment",
    success_url: url,
    cancel_url: url,
  });

  // Return checkout page url
  return res.status(200).json({
    status: "success",
    data: {
      stripeSessionUrl: session.url,
    },
  });
});

exports.getOneOrder = crudController.getOne(Order);
exports.getAllOrders = crudController.getAll(Order);
exports.createOneOrder = crudController.createOne(Order);
exports.updateOneOrder = crudController.updateOne(Order);
exports.deleteOneOrder = crudController.deleteOne(Order);
