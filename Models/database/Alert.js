const mongoose = require("mongoose");
const validator = require("validator");
const { Stack } = require("datastructures-js");
const UoftSection = require("./Section/UoftSection"); // Required for instance methods

const enums = require("../../data/enums");
const throttledQueue = require("throttled-queue");

const activeAlertDelay = 1000 * 60 * 60;

const alertSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: [true, "Please provide an email to send alerts."],
    maxLength: [500, "Email address cannot exceed 500 characters."],
    validate: [validator.isEmail, "Please provide a valid email address."],
  },
  school: {
    type: String,
    required: [true, "Please provide a school for this alert."],
    enum: {
      values: enums.schools,
      message: "Please provide a valid school.",
    },
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: [true, "Alert must belong to a course."],
  },
  sections: {
    type: [mongoose.Schema.ObjectId],
    ref: "Section",
    validator: [
      {
        validate: validateSectionsCourse,
        message: "Section must belong to provided course.",
      },
      {
        validate: validateSectionsLength,
        message: "Please provide at least one section.",
      },
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastAlertedAt: {
    type: Date,
    default: new Date(Date.now() - activeAlertDelay),
  },
});

// TODO
function validateSectionsCourse(sections) {
  return true;
}

function validateSectionsLength(sections) {
  return sections.length > 0;
}

/**
 * INDEXES
 */

alertSchema.index({ email: 1, course: 1 }, { unique: true });

/**
 * STATICS
 */

alertSchema.statics.findActiveAlerts = async function (school) {
  const alerts = await this.find({
    school,
    isActive: true,
    lastAlertedAt: {
      $lt: new Date(Date.now() - activeAlertDelay),
    },
  }).populate({ path: "course" });

  return alerts.filter((alert) => alert.course !== null);
};

alertSchema.statics.processAlerts = async function (alerts, { processor, throttleDelay }) {
  alerts.sort((a, b) => String(b.course.code).localeCompare(a.course.code));

  const stack = new Stack(alerts);
  const courseCache = new Map();

  const throttle = throttledQueue(1, Number(throttleDelay));
  while (!stack.isEmpty()) {
    await throttle(() => processor(stack.pop(), courseCache));
  }

  return courseCache;
};

/**
 * METHODS
 */

alertSchema.methods.getFreedSections = async function (updatedSections) {
  await this.populate("sections");
  const alertableSections = this.sections;

  const freedSections = alertableSections.filter((alertableSection) => {
    const updatedSection = findUpdatedSection(updatedSections, alertableSection);
    return alertableSection.isFreed(updatedSection);
  });

  return freedSections;

  function findUpdatedSection(updatedSections, alertableSection) {
    return updatedSections.find(
      (s) => s.type === alertableSection.type && s.number === alertableSection.number
    );
  }
};

alertSchema.methods.sendAlert = async function () {};

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
