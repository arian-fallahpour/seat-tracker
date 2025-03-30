import mongoose from "mongoose";

import enums from "../../data/enums.js";

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
export default Log;
