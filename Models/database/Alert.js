const mongoose = require("mongoose");
const validator = require("validator");
const { Stack } = require("datastructures-js");
const UoftSection = require("./Section/UoftSection"); // Required for instance methods

const formData = require("form-data");
const Mailgun = require("mailgun.js");

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
      values: enums.alert.school,
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
  const lastAlertedAtBefore =
    process.env.NODE_ENV === "production"
      ? new Date(Date.now() - activeAlertDelay)
      : new Date(Date.now() + 1000);

  const alerts = await this.find({
    school,
    isActive: true,
    lastAlertedAt: {
      $lt: lastAlertedAtBefore,
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

alertSchema.methods.sendAlert = async function (freedSections) {
  let message = "";
  freedSections.forEach((section) => {
    console.log(
      `[ALERT] (email: ${this.email}): Section ${section.type} ${section.number} in ${this.course.code} is now open!`
    );
    message += `Section ${section.type} ${section.number} in ${this.course.code} is now open!\n`;
  });

  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });

  // Send email message
  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Seat Tracker <alerts@${process.env.MAILGUN_DOMAIN}>`,
      to: [this.email],
      subject: `New seats open for ${this.course.code}`,
      text: `${message}`,
      html: `<strong>${message}</strong>`,
    });
    console.log(`[INFO] Email sent to ${this.email}`);
  } catch (err) {
    console.dir(err, { depth: null });
  }

  this.lastAlertedAt = new Date(Date.now());
  await this.save();
};

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
