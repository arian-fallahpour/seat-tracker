const mongoose = require("mongoose");

const enums = require("../data/enums");

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Please provide a log type."],
    enum: {
      values: enums.log.type,
      message: "Please provide a valid log type.",
    },
  },
  message: {
    type: String,
    required: [true, "Please provide a log message."],
  },
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: new Date(Date.now()),
  },
});

const Log = mongoose.models?.Log || mongoose.model("Log", logSchema);
module.exports = Log;
