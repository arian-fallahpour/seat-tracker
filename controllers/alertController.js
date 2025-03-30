import * as crudController from "./crudController.js";
import Alert from "../models/database/Alert.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const getAlertInfo = catchAsync(async (req, res, next) => {
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

export const editAlertInfo = catchAsync(async (req, res, next) => {
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

export const getOneAlert = crudController.getOne(Alert);
export const getAllAlerts = crudController.getAll(Alert);
export const createOneAlert = crudController.createOne(Alert);
export const updateOneAlert = crudController.updateOne(Alert);
export const deleteOneAlert = crudController.deleteOne(Alert);
