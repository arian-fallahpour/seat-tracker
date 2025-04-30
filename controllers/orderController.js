const crudController = require("./crudController");
const OrderModel = require("../models/OrderModel");
const AlertModel = require("../models/AlertModel");
const catchAsync = require("../utils/app/catchAsync");
const AppError = require("../utils/app/AppError");
const businessData = require("../data/business-data");
const UoftCourseModel = require("../models/Course/UoftCourseModel");

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
  const allowedStatus = ["processing", "active"];
  let alert = await AlertModel.findOne({ email, course: courseId, status: allowedStatus });
  if (!alert) {
    alert = await AlertModel.create({ email, course: courseId, sections });
  } else if (alert.status === "processing") {
    alert.sections = sections;
    await alert.save();
  } else {
    const message = `You already have an alert that is ${alert.status} for this course.`;
    return next(new AppError(message, 400));
  }

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
  const url = `${protocol}://${host}`;

  // Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: businessData.stripe.alertPriceID,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    metadata: { alert: alert.id, order: order.id },
    mode: "payment",
    success_url: url,
    cancel_url: url,
  });

  // Save stripe session id to order
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

exports.getOneOrder = crudController.getOne(OrderModel);
exports.getAllOrders = crudController.getAll(OrderModel);
exports.createOneOrder = crudController.createOne(OrderModel);
exports.updateOneOrder = crudController.updateOne(OrderModel);
exports.deleteOneOrder = crudController.deleteOne(OrderModel);
