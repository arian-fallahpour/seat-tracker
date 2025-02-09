const mongoose = require("mongoose");
const validator = require("validator");
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
  lastAlertedAt: Date,
});

// TODO
function validateSectionsCourse(sections) {
  return true;
}

function validateSectionsLength(sections) {
  return sections.length > 0;
}

alertSchema.index({ email: 1, course: 1 }, { unique: true });

alertSchema.statics.findActiveAlerts = async function (school) {
  const alerts = await Alert.find({
    school,
    isActive: true,
    // lastAlertedAt: { $lt: Date.now() - 1000 * 60 * 60 },
  }).populate({ path: "course" });
  alerts.sort((a, b) => String(b.course.code).localeCompare(a.course.code));
  return alerts;
};

alertSchema.methods.sendAlert = async function () {};

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
