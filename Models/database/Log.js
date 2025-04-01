const mongoose = require("mongoose");

const enums = require("../../data/enums");

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Please provide a log type"],
    enum: {
      values: enums.log.type,
      message: "Please provide a valid log type.",
    },
  },
  description: {
    type: String,
    required: [true, "Please provide a description of the log"],
  },
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
