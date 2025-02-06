const mongoose = require("mongoose");
const validator = require("validator");
const enums = require("../data/enums");

const alertSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: [true, "Please provide an email to send alerts."],
      maxLength: [500, "Email address cannot exceed 500 characters."],
      validate: [validator.isEmail, "Please provide a valid email address."],
    },
    school: {
      type: String,
      enum: {
        values: enums.schools,
        message: "Please provide a valid school.",
      },
    },
    class: {
      type: String,
      required: [true, "Please provide a class to send alerts."],
      maxLength: [200, "Class cannot exceed 200 characters."],
    },
    lastAlertedAt: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

alertSchema.methods.sendAlert = async function () {};

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
