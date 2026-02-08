import { FormattedUoftSectionType } from "@/Types/UoftTypes";
import {
  alertCodeValidMin,
  AlertMethodsType,
  AlertModelType,
  alertStatusType,
  AlertType,
  CourseMethodsType,
  CourseType,
  defaultAlertStatus,
  HydratedCourseType,
} from "@/Types/ModelTypes";
import mongoose, { HydratedDocument, model, Schema } from "mongoose";

import crypto from "crypto";
import validator from "validator";
import Email from "@/utils/app/Email";

import CourseModel from "./CourseModel";
import SectionModel from "./SectionModel";
import alertsData from "../data/alerts-data";
import UoftAdapter from "@/utils/Uoft/UoftAdapter";
import Logger from "@/utils/Logger";
import { upsertCoursesAndSections } from "@/utils/app/schema-utils";

const alertSchema = new Schema<AlertType, AlertModelType, AlertMethodsType>({
  email: {
    type: String,
    lowercase: true,
    required: [true, "Please provide an email to send alerts."],
    maxLength: [500, "Email address cannot exceed 500 characters."],
    validate: [validator.isEmail, "Please provide a valid email address."],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: [true, "Alert must belong to a course."],
  },
  sections: {
    type: [mongoose.Schema.ObjectId],
    ref: "Section",
    validate: [
      {
        validator: function (sections) {
          return sections.length > 0;
        },
        message: "Please select at least one section.",
      },
      {
        validator: function (sections) {
          return sections.length <= alertsData.maxSectionsPerAlert;
        },
        message: `You cannot select more than ${alertsData.maxSectionsPerAlert} sections.`,
      },
    ],
  },
  status: {
    type: String,
    enum: {
      values: alertStatusType,
      message: "Please provide a valid alert status.",
    },
    default: defaultAlertStatus,
  },
  createdAt: { type: Date, default: Date.now },
  lastAlertedAt: Date,
  verificationCode: String,
  verificationExpiresAt: Date,
});

// alertSchema.index({ email: 1, course: 1 }, { unique: true });
alertSchema.index({ createdAt: 1 }); // Needed for sort

/**
 * STATICS
 */

alertSchema.statics.encryptCode = function (code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
};

/**
 * METHODS
 */

alertSchema.methods.activate = async function () {
  if (!this.populated("course")) await this.populate("course");
  const course = this.course as unknown as HydratedCourseType;

  Logger.info(`Activating ${this.email}'s alert on course ${course.code}`);

  await new Email({
    to: this.email,
    subject: `Alert activated for ${course.code}`,
    template: "alert-activate",
    data: { alert: this, course },
  }).send();

  this.status = "active";
  await this.save();

  const updatedCourses = await UoftAdapter.fetch({ query: course.code, method: "api" }); // TODO: change to lambda
  if (updatedCourses.length === 0) return;

  await upsertCoursesAndSections(updatedCourses);
};

alertSchema.methods.deactivate = async function () {
  if (!this.populated("course")) await this.populate("course");
  const course = this.course as unknown as HydratedCourseType;

  Logger.info(`Deactivating ${this.email}'s alert on course ${course.code}`);

  this.status = "inactive";
  await this.save();
};

alertSchema.methods.notify = async function (alteredSections: FormattedUoftSectionType[]) {
  if (this.status === "paused") return;
  if (!alteredSections || alteredSections.length === 0) return;

  if (!this.populated("course")) await this.populate("course");
  const course = this.course as unknown as HydratedCourseType;

  Logger.info(`Attempting to notify ${this.email} for ${course.code}`);

  await new Email({
    to: this.email,
    subject: `New seats open for ${course.code}`,
    template: "alert-notify",
    data: { alert: this, course, alteredSections },
  }).send();

  this.lastAlertedAt = new Date(Date.now());
  await this.save();
};

alertSchema.methods.createVerification = async function () {
  if (!this.populated("course")) await this.populate("course");
  const course = this.course as unknown as HydratedCourseType;

  const code = crypto.randomBytes(32).toString("hex");
  this.verificationCode = (this.constructor as AlertModelType).encryptCode(code);
  this.verificationExpiresAt = new Date(Date.now() + alertCodeValidMin * 60 * 1000);
  await this.save();

  await new Email({
    to: this.email,
    subject: "Alert verification code",
    template: "alert-verify",
    data: { alert: this, course, code },
  }).send();
};

alertSchema.methods.expireVerification = async function () {
  this.verificationCode = undefined;
  this.verificationExpiresAt = undefined;
  await this.save();
};

const AlertModel =
  (mongoose.models.Alert as AlertModelType) ||
  model<AlertType, AlertModelType>("Alert", alertSchema);

export default AlertModel;
