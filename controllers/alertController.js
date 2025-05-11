const crudController = require("./crudController");
const AlertModel = require("../models/AlertModel");
const catchAsync = require("../utils/app/catchAsync");
const AppError = require("../utils/app/AppError");
const { encryptCode } = require("../utils/helper-server");

exports.getAlertInfo = catchAsync(async (req, res, next) => {
  const alert = await AlertModel.getInfo(req.params.id);
  if (!alert) {
    return next(new AppError("Could not find alert with provided id.", 404));
  } else if (alert.status === "inactive") {
    return next(new AppError("Alert is no longer active.", 400));
  }

  return res.status(200).json({
    status: "success",
    data: {
      alert,
    },
  });
});

exports.editAlertInfo = catchAsync(async (req, res, next) => {
  const { email, isPaused, sections } = req.body;

  // Find alert and do not allow editing if inactive
  const alert = await AlertModel.getInfo(req.params.id);
  if (!alert) {
    return next(new AppError("Could not find alert with provided id.", 404));
  } else if (alert.status === "inactive") {
    return next(new AppError("Alert is no longer active.", 400));
  }

  const courseSectionIds = alert.course.sections.map((s) => s.id);

  // Apply filtered updates
  alert.email = email;
  if (Array.isArray(sections))
    alert.sections = sections.filter((s) => courseSectionIds.includes(s));
  if (typeof isPaused === "boolean") alert.isPaused = isPaused;
  await alert.save();

  return res.status(200).json({
    status: "success",
    data: {
      alert,
    },
  });
});

exports.getAlertsCount = catchAsync(async (req, res, next) => {
  const alerts = await AlertModel.aggregate([
    { $match: { status: "active" } },
    { $count: "count" },
  ]);

  return res.status(200).json({
    status: 200,
    data: { count: (alerts.length > 0 && alerts[0].count) || 0 },
  });
});

exports.verifyAlert = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  if (!code) return next(new AppError("Please provide a verification code.", 400));

  // Check if verification code is valid
  const alert = await AlertModel.findOne({
    verificationCode: encryptCode(code),
    verificationExpiresAt: { $gt: new Date(Date.now()) },
  });
  if (!alert) return next(new AppError("Verification code is invalid or expired.", 404));

  // Remove the verification code and expiration date
  await alert.verify();

  // Activate alert
  await alert.activate();

  // Send response
  return res.status(200).json({
    status: 200,
    message: "Alert has been verified! Check your inbox for its activation.",
  });
});

exports.getOneAlert = crudController.getOne(AlertModel);
exports.getAllAlerts = crudController.getAll(AlertModel);
exports.createOneAlert = crudController.createOne(AlertModel);
exports.updateOneAlert = crudController.updateOne(AlertModel);
exports.deleteOneAlert = crudController.deleteOne(AlertModel);
