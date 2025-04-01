const crudController = require("./crudController");
const Alert = require("../models/database/Alert");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getAlertInfo = catchAsync(async (req, res, next) => {
  const alert = await Alert.getAlertInfo(req.params.id);
  if (!alert) {
    return next(new AppError("Could not find alert with provided id.", 404));
  }

  return res.status(200).json({
    status: "success",
    data: {
      alert,
    },
  });
});

exports.editAlertInfo = catchAsync(async (req, res, next) => {
  const { email, status, sections } = req.body;

  // Find alert
  const alert = await Alert.getAlertInfo(req.params.id);
  if (!alert) {
    return next(new AppError("Could not find alert with provided id.", 404));
  }

  const courseSectionIds = alert.course.sections.map((s) => s.id);

  // Apply filtered updates
  alert.email = email;
  if (Array.isArray(sections))
    alert.sections = sections.filter((s) => courseSectionIds.includes(s));
  if (status && ["active", "paused"].includes(status)) alert.status = status;
  await alert.save();

  return res.status(200).json({
    status: "success",
    data: {
      alert,
    },
  });
});

exports.getOneAlert = crudController.getOne(Alert);
exports.getAllAlerts = crudController.getAll(Alert);
exports.createOneAlert = crudController.createOne(Alert);
exports.updateOneAlert = crudController.updateOne(Alert);
exports.deleteOneAlert = crudController.deleteOne(Alert);
