const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const enums = require("../data/enums");
const Email = require("../utils/app/Email");
const UoftCourseModel = require("./Course/UoftCourseModel");
const UoftAdapter = require("../utils/Uoft/UoftAdapter");
const Logger = require("../utils/Logger");
const { maxSectionsPerAlert } = require("../data/alerts-data");
const alertsData = require("../data/alerts-data");

require("./Section/UoftSectionModel"); // Required for instance methods

const alertSchema = new mongoose.Schema({
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
          return sections.length <= maxSectionsPerAlert;
        },
        message: `You cannot select more than ${maxSectionsPerAlert} sections.`,
      },
    ],
  },
  status: {
    type: String,
    enum: {
      values: enums.alert.status,
      message: "Please provide a valid alert status.",
    },
    default: enums.alert.status[0],
  },
  isPaused: {
    type: Boolean,
    default: false,
    required: [true, "Please indicate if this alert has been paused or not."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAlertedAt: Date,
  verificationCode: String,
  verificationExpiresAt: Date,
});

/**
 * INDEXES
 */

// alertSchema.index({ email: 1, course: 1 }, { unique: true });
alertSchema.index({ createdAt: 1 }); // Needed for sort

/**
 * MIDDLEWARE
 */

/**
 * STATICS
 */

alertSchema.statics.getInfo = async function (id) {
  const alert = await Alert.findById(id).populate({
    path: "course",
    populate: { path: "sections" },
  });
  return alert;
};

alertSchema.statics.encryptCode = function (code) {
  return crypto.createHash("sha256").update(code).digest("hex");
};

/**
 * METHODS
 */

alertSchema.methods.getOpenedSections = function (updatedCourse) {
  if (!this.populated("sections")) {
    throw new Error("Please populate alert's sections before calling this function.");
  }

  const updatedSectionsByCode = {};
  for (const updatedSection of updatedCourse.sections) {
    updatedSectionsByCode[updatedSection.type + updatedSection.number] = updatedSection;
  }

  const freedSections = [];
  for (const section of this.sections) {
    const updatedSection = updatedSectionsByCode[section.type + section.number];

    if (!updatedSection) continue;
    if (!section.hasOpened(updatedSection)) continue;

    freedSections.push(updatedSection);
  }

  return freedSections;
};

alertSchema.methods.activate = async function () {
  await this.populate([{ path: "course" }, { path: "sections" }]);

  const emailData = { course: this.course, alert: this };

  // Construct and send the activation email
  new Email({
    to: this.email,
    subject: `Alert activated for ${this.course.code}`,
    template: "alert-activate",
    data: emailData,
  }).send();

  // Set status to active
  this.status = "active";
  await this.save();

  // Update course's data in database
  const updatedCourses = await UoftAdapter.fetchCourses({ query: this.course.code });
  if (updatedCourses.length === 0) return;
  await UoftCourseModel.upsertCoursesAndSections(updatedCourses);
};

alertSchema.methods.deactivate = async function () {
  Logger.info(`Deactivating ${this.email}'s alert for ${this.course.code}.`);

  this.status = "inactive";
  await this.save();
};

alertSchema.methods.notify = async function () {
  if (this.isPaused) return;
  if (!this.freedSections || this.freedSections.length === 0) return;

  Logger.info(`Attempting to notify ${this.email} for ${this.course.code}`);

  const emailData = {
    course: this.course,
    alert: this,
    freedSections: this.freedSections,
  };

  // Construct and send notification email
  new Email({
    to: this.email,
    subject: `New seats open for ${this.course.code}`,
    template: "alert-notify",
    data: emailData,
  }).send();

  // Update last alerted at
  this.lastAlertedAt = new Date(Date.now());
  await this.save();

  Logger.log(`Sent ${this.email} for ${this.course.code}`);
};

alertSchema.methods.createVerificationCode = async function () {
  await this.populate("course");

  // Generate a random verification code
  const verificationCode = crypto.randomBytes(32).toString("hex");

  // Set the verification code and sent date
  this.verificationCode = this.constructor.encryptCode(verificationCode);
  this.verificationExpiresAt = new Date(
    Date.now() + alertsData.alertVerificationTimeLimitMinutes * 60 * 1000 // 10 minutes
  );
  await this.save();

  // Send verification code
  new Email({
    to: this.email,
    subject: "Alert verification code",
    template: "alert-verify",
    data: { alert: this, course: this.course, code: verificationCode },
  }).send();
};

alertSchema.methods.expireVerification = async function () {
  this.verificationCode = undefined;
  this.verificationExpiresAt = undefined;
  await this.save();
};

const Alert = mongoose.models?.Alert || mongoose.model("Alert", alertSchema);

module.exports = Alert;
