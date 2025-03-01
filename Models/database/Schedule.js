const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, "Schedule name must be unique"],
    required: [true, "Please provide the schedule name"],
  },
  lastCalledAt: Date,
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
