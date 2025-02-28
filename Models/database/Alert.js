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
  // TODO: Test (with null, and less than time)
  const alerts = await this.find({
    school,
    status: "active",
  }).populate({ path: "course" });

  return alerts.filter((alert) => alert.course !== null);
};

alertSchema.statics.groupAlertsByCode = function (alerts) {
  const groupedAlertsMap = new Map();

  for (const alert of alerts) {
    if (!groupedAlertsMap.has(alert.course.code)) {
      groupedAlertsMap.set(alert.course.code, []);
    }

    const group = groupedAlertsMap.get(alert.course.code);
    group.push(alert);
  }

  return groupedAlertsMap;
};

alertSchema.statics.processAlerts = async function (alerts, updatedCoursesMap) {
  for (const alert of alerts) {
    const updatedCourse = updatedCoursesMap.get(alert.course.code);

    // Check if any of the alert's sections are freed up
    const freedSections = await alert.getFreedSections(updatedCourse.sections);
    if (freedSections.length === 0) continue;

    // send notification
    await alert.sendAlert(freedSections);
  }
};

/**
 * METHODS
 */

alertSchema.methods.activateAlert = async function () {
  this.status = "active";
  await this.save();
};

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
