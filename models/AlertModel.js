const mongoose = require("mongoose");
const validator = require("validator");

const enums = require("../data/enums");
const Email = require("../utils/app/Email");
const UoftCourseModel = require("./Course/UoftCourseModel");
const UoftAdapter = require("../utils/Uoft/UoftAdapter");
const Logger = require("../utils/Logger");
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
        validator: validateSectionsLength,
        message: "Please select at least one section.",
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
    required: [true, "Please indicate if this alert has been paused or not."],
    default: false,
  },
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
  lastAlertedAt: Date,
});

function validateSectionsLength(sections) {
  return sections.length > 0;
}

/**
 * INDEXES
 */

alertSchema.index({ email: 1, course: 1 }, { unique: true });

/**
 * MIDDLEWARE
 */

// alertSchema.pre("save", async function (next) {
//   if (!(this.isModified("status") && this.status === "active")) {
//     return next();
//   }

//   const course = await UoftCourseModel.findById(this.course);
//   const updatedCourses = await UoftAdapter.fetchCourses({ query: course.code });
//   const updatedCourse = updatedCourses.find((updatedCourse) => updatedCourse.code === course.code);

//   await course.save();
// });

/**
 * STATICS
 */

/**
 * Returns alerts that are active and not paused, as well as associated course and sections
 */
alertSchema.statics.findAlertable = async function () {
  const alerts = await this.find({ status: "active", isPaused: false })
    .populate({ path: "course" })
    .populate({ path: "sections" });

  const filtered = alerts.filter((alert) => alert.course !== null);
  return filtered;
};

alertSchema.statics.getInfo = async function (id) {
  const alert = await Alert.findById(id).populate({
    path: "course",
    populate: { path: "sections" },
  });
  return alert;
};

/**
 * Returns an object of alerts grouped by their course code
 */
alertSchema.statics.groupByCode = function (alerts = []) {
  const groupedAlerts = {};

  for (const alert of alerts) {
    if (!alert.course.code) continue;
    if (!groupedAlerts[alert.course.code]) {
      groupedAlerts[alert.course.code] = [];
    }

    groupedAlerts[alert.course.code].push(alert);
  }

  return groupedAlerts;
};

alertSchema.statics.deactivateExpired = async function (alerts) {
  const enrollableAlerts = [];

  const deactivateAlert = async (alert) => {
    if (!alert.course.isEnrollable()) await alert.deactivate();

    enrollableAlerts.push(alert);
  };

  const promises = alerts.map((alert) => deactivateAlert(alert));
  await Promise.allSettled(promises);

  return enrollableAlerts;
};

alertSchema.statics.filterAllNotifiable = async function (alerts = [], updatedCoursesByCode = {}) {
  const filteredAlerts = [];

  const filterAlert = async (alert) => {
    // Check if updatedCourse was found
    const updatedCourse = updatedCoursesByCode[alert.course.code];
    if (!updatedCourse) return;

    // Check if any sections were freed
    const freedSections = await alert.getFreedSections(updatedCourse);
    if (freedSections.length === 0) return;

    // Add to filtered alerts and set its freedSections
    alert.freedSections = freedSections;
    filteredAlerts.push(alert);
  };

  const promises = alerts.map((alert) => filterAlert(alert));
  await Promise.allSettled(promises);

  return filteredAlerts;
};

alertSchema.statics.notifyAll = async function (alerts = []) {
  const sendNotification = async (alert) => {
    await alert.notify();
  };

  const promises = alerts.map((alert) => sendNotification(alert));
  await Promise.allSettled(promises);
};

/**
 * METHODS
 */

alertSchema.methods.getFreedSections = async function (updatedCourse) {
  if (!this.populated("sections") || !this.sections) {
    await this.populate("sections");
  }

  // Create an object of updated Sections by their type and number
  const sectionEntries = updatedCourse.sections.map((s) => [s.type + s.number, s]);
  const updatedSections = Object.fromEntries(sectionEntries);

  // Filter sections that have freed up
  const freedSections = [];
  for (const section of this.sections) {
    const updatedSection = updatedSections[section.type + section.number];

    if (!updatedSection) continue;
    if (!section.isFreed(updatedSection)) continue;

    freedSections.push(updatedSection);
  }

  return freedSections;
};

/**
 * Sends activation email to email address associated with alert
 */
alertSchema.methods.activate = async function () {
  await this.populate([{ path: "course" }, { path: "sections" }]);

  const emailData = { course: this.course, alert: this };

  // Construct and send the activation email
  await new Email({
    to: this.email,
    subject: `Alert activated for ${this.course.code}`,
    template: "alert-data",
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

/**
 * Sends notification email to email address associated with alert
 */
alertSchema.methods.notify = async function () {
  if (!this.freedSections || this.freedSections.length === 0) {
    throw new Error("Alert was asked to notify, but has no freed sections");
  }

  const emailData = {
    course: this.course,
    alert: this,
    freedSections: this.freedSections,
  };

  // Construct and send notification email
  await new Email({
    to: this.email,
    subject: `New seats open for ${this.course.code}`,
    template: "alert-notify",
    data: emailData,
  }).send();

  // Update last alerted at
  this.lastAlertedAt = new Date(Date.now());
  await this.save();
};

const Alert = mongoose.models?.Alert || mongoose.model("Alert", alertSchema);

module.exports = Alert;
