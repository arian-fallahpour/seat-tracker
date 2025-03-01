const mongoose = require("mongoose");
const validator = require("validator");
const UoftSection = require("./Section/UoftSection"); // Required for instance methods

const formData = require("form-data");
const Mailgun = require("mailgun.js");

const enums = require("../../data/enums");

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
  status: {
    type: String,
    enum: {
      values: enums.alert.status,
      message: "Please provide a valid alert status.",
    },
    default: enums.alert.status[0],
  },
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
  lastAlertedAt: Date,
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
  try {
    const alerts = await this.find({
      school,
      status: "active",
    }).populate({ path: "course" });

    return alerts.filter((alert) => alert.course !== null);
  } catch (error) {
    console.error(`[ERROR] Could not find active alerts: ${error.message}`);
  }

  return [];
};

/**
 * Returns an object of alerts grouped by their course code
 */
alertSchema.statics.groupAlertsByCode = function (alerts) {
  const groupedAlerts = {};

  for (const alert of alerts) {
    if (typeof groupedAlerts[alert.course.code] === "undefined") {
      groupedAlerts[alert.course.code] = [];
    }

    groupedAlerts[alert.course.code].push(alert);
  }

  return groupedAlerts;
};

alertSchema.statics.processAlerts = async function (alerts, updatedCourses) {
  for (const alert of alerts) {
    const updatedCourse = updatedCourses[alert.course.code];

    // Check if any of the alert's sections are freed up
    const freedSections = await alert.getFreedSections(updatedCourse);
    if (freedSections.length === 0) continue;

    // Send notification
    await alert.notify(freedSections);
  }
};

/**
 * METHODS
 */

alertSchema.methods.activateAlert = async function () {
  this.status = "active";
  await this.save();
};

alertSchema.methods.getFreedSections = async function (updatedCourse) {
  const sectionsEntries = updatedCourse.sections.map((s) => [s.type + s.number, s]);
  const updatedSections = Object.fromEntries(sectionsEntries);

  // Populate sections that should be alerted
  await this.populate("sections");
  const alertableSections = this.sections;

  // Filter sections that have freed up
  const freedSections = [];
  for (const alertableSection of alertableSections) {
    const updatedSection = updatedSections[alertableSection.type + alertableSection.number];

    if (alertableSection.isFreed(updatedSection)) {
      freedSections.push(alertableSection);
    }
  }

  return freedSections;
};

alertSchema.methods.notify = async function (freedSections) {
  let message = "";
  for (const freedSection of freedSections) {
    const alertMessage = `Section ${freedSection.type} ${freedSection.number} in ${this.course.code} is now open!`;

    console.log(`[ALERT] (email: ${this.email}): ${alertMessage}`);
    message += `${alertMessage}\n`;
  }

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
  } catch (error) {
    console.error(error);
  }

  this.lastAlertedAt = new Date(Date.now());
  await this.save();
};

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
