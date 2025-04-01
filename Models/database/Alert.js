const mongoose = require("mongoose");
const validator = require("validator");

const enums = require("../../data/enums");
const Email = require("../../utils/Email");
const Logger = require("../../utils/Logger");
const UoftSection = require("./Section/UoftSection"); // Required for instance methods

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

/**
 * Returns currently active alerts and associated course
 */
alertSchema.statics.findActive = async function () {
  const alerts = await this.find({
    status: "active",
  }).populate({ path: "course" });

  const filtered = alerts.filter((alert) => alert.course !== null);
  return filtered;
};

alertSchema.statics.getAlertInfo = async function (id) {
  return await Alert.findById(id).populate({
    path: "course",
    populate: {
      path: "sections",
      select: "type number campus lastUpdatedAt",
    },
  });
};

/**
 * Returns an object of alerts grouped by their course code
 */
alertSchema.statics.groupByCode = function (alerts) {
  const groupedAlerts = {};

  for (const alert of alerts) {
    if (typeof groupedAlerts[alert.course.code] === "undefined") {
      groupedAlerts[alert.course.code] = [];
    }

    groupedAlerts[alert.course.code].push(alert);
  }

  return groupedAlerts;
};

alertSchema.statics.process = async function (alerts, updatedCourses) {
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

/**
 * Sends activation email to email address associated with alert
 *
 * Logs error, but does not throw if unsuccessful
 */
alertSchema.methods.activate = async function () {
  await this.populate("course");

  // Construct message
  let message = `You are now going to be alerted for ${this.course.code} when the following sections are open: \n`;
  message += this.sections.join("\n");

  try {
    // Construct and send the activation email
    await new Email()
      .toEmail(this.email)
      .withSubject(`Alerts activated for ${this.course.code}`)
      .withTemplate("alert-activate", { alert: this })
      .send();
    Logger.info(`Activation email sent to ${this.email}`);

    // Set status to active
    this.status = "active";
    await this.save();
  } catch (error) {
    Logger.alert(`Alert activation email not sent to ${this.email}`, {
      email: this.email,
      alert: this.id,
    });
  }
};

/**
 * Sends notification email to email address associated with alert
 *
 * Logs error, but does not throw if unsuccessful
 */
alertSchema.methods.notify = async function (freedSections = []) {
  let message = [];
  for (const freedSection of freedSections) {
    message.push(
      `Section ${freedSection.type} ${freedSection.number} in ${this.course.code} is now open!`
    );
  }
  message = message.join("\n");

  try {
    // Construct and send notification email
    await new Email()
      .toEmail(this.email)
      .withSubject(`New seats open for ${this.course.code}`)
      .withTemplate("alert-notify", { alert: this })
      .send();
    Logger.info(`Alert notification email sent to ${this.email}`);

    // Update last alerted at
    this.lastAlertedAt = new Date(Date.now());
    await this.save();
  } catch (error) {
    Logger.alert(`Alert notification email not sent to ${this.email}`, {
      email: this.email,
      alert: this.id,
      error: error.message,
    });
  }
};

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
