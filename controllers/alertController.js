const crudController = require("./crudController");
const AlertModel = require("../models/AlertModel");
const catchAsync = require("../utils/app/catchAsync");
const AppError = require("../utils/app/AppError");

exports.getAlertInfo = catchAsync(async (req, res, next) => {
  const alert = await AlertModel.getInfo(req.params.id);
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
  const alert = await AlertModel.getInfo(req.params.id);
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

exports.getAlertsCount = async (req, res, next) => {
  const alerts = await AlertModel.aggregate([
    {
      $match: { status: "active" },
    },
    { $count: "count" },
  ]);

  return res.status(200).json({
    status: 200,
    data: { count: alerts[0].count },
  });
};

exports.getOneAlert = crudController.getOne(AlertModel);
exports.getAllAlerts = crudController.getAll(AlertModel);
exports.createOneAlert = crudController.createOne(AlertModel);
exports.updateOneAlert = crudController.updateOne(AlertModel);
exports.deleteOneAlert = crudController.deleteOne(AlertModel);
