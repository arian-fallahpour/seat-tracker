import { NextFunction, Request, Response } from "express";

import AlertModel from "../models/AlertModel";
import catchAsync from "../utils/app/catchAsync";
import AppError from "../utils/app/AppError";
import alertsData from "../data/alerts-data";
import * as crudController from "./crudController";
import { HydratedDocument } from "mongoose";
import { CourseType, SectionType } from "@/Types/ModelTypes";

type PopulatedAlertType = {
  course: HydratedDocument<CourseType>;
  sections: HydratedDocument<SectionType>[];
};

export const getAlertInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const alert = await AlertModel.findById(req.params.id).populate<PopulatedAlertType>({
    path: "course",
    populate: { path: "sections" },
  });

  if (!alert) return next(new AppError("Could not find alert with provided id.", 404));
  if (alert.status === "inactive") return next(new AppError("Alert is no longer active.", 400));

  return res.status(200).json({
    status: "success",
    data: {
      alert,
    },
  });
});

export const editAlertInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, status, sections } = req.body;

  const alert = await AlertModel.findById(req.params.id).populate<PopulatedAlertType>({
    path: "course",
    populate: { path: "sections" },
  });

  if (!alert) return next(new AppError("Could not find alert with provided id.", 404));
  if (alert.status === "inactive") return next(new AppError("Alert is no longer active.", 400));

  const ids = alert.course.sections.map((s) => s.id);
  if (email) alert.email = email;
  if (Array.isArray(sections)) alert.sections = sections.filter((s) => ids.includes(s));
  if (alert.status === "paused" && status === "active") alert.status = "active";
  else if (alert.status === "active" && status === "paused") alert.status = "paused";
  await alert.save();

  return res.status(200).json({
    status: "success",
    data: {
      alert,
    },
  });
});

export const getAlertsCount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const alerts = await AlertModel.aggregate([{ $count: "count" }]);

    return res.status(200).json({
      status: 200,
      data: { count: (alerts.length > 0 && alerts[0].count) || 0 },
    });
  },
);

export const verifyAlert = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;
  if (!code) return next(new AppError("Please provide a verification code.", 400));

  // Check if verification code is valid
  const alert = await AlertModel.findOne({
    verificationCode: AlertModel.encryptCode(code),
    verificationExpiresAt: { $gt: new Date(Date.now()) },
  });
  if (!alert) return next(new AppError("Verification code is invalid or expired.", 404));

  // TODO: Prevent duplication of this code, also found in orderController

  // Check if user with email already created the maximum number of alerts in the cooldown period
  const recentlyActivatedAlerts = await AlertModel.find({
    email: alert.email,
    status: "active",
    createdAt: {
      $gte: new Date(Date.now() - alertsData.alertCreationCooldownDays * 24 * 60 * 60 * 1000),
    },
  });

  if (recentlyActivatedAlerts.length >= alertsData.alertCreationCooldownCount) {
    const tryAgainTime =
      alertsData.alertCreationCooldownDays === 1
        ? "tomorrow"
        : `in ${alertsData.alertCreationCooldownDays} days`;
    return next(
      new AppError(
        `You already created ${alertsData.alertCreationCooldownCount} alerts today. Please try again ${tryAgainTime}.`,
        400,
      ),
    );
  }

  // Remove the verification code and expiration date
  await alert.expireVerification();

  // Activate alert
  await alert.activate();

  // Send response
  return res.status(200).json({
    status: 200,
    message: "Alert has been verified! Check your inbox for its activation.",
  });
});

export const getOneAlert = crudController.getOne(AlertModel);
export const getAllAlerts = crudController.getAll(AlertModel);
export const createOneAlert = crudController.createOne(AlertModel);
export const updateOneAlert = crudController.updateOne(AlertModel);
export const deleteOneAlert = crudController.deleteOne(AlertModel);
