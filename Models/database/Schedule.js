const { CronJob } = require("cron");
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, "Schedule name must be unique"],
    required: [true, "Please provide the schedule name"],
  },
  lastCalledAt: Date,
});

/**
 * STATICS
 */

scheduleSchema.statics.initRecurringSchedule = async function (scheduleName, options) {
  if (typeof options.onTick !== "function") throw new Error("Please provide an onTick function");
  options = {
    periodMinutes: options.periodMinutes || 15,
    onTick: options.onTick,
  };

  // Find schedule, or create new one if it doesn't exist
  let schedule = await Schedule.findOne({ name: scheduleName });
  if (!schedule) {
    schedule = await Schedule.create({ name: scheduleName });
  }

  // Determine when the cron job should be initialized and executed
  let shouldRunInMS = 0;
  const earliestCalledAt = new Date(Date.now() - 1000 * 60 * options.periodMinutes);
  if (schedule.lastCalledAt && schedule.lastCalledAt > earliestCalledAt) {
    shouldRunInMS = schedule.lastCalledAt - earliestCalledAt;
  }

  // Create onTick function that updates lastCalledAt of schedule when it fires
  async function onTick() {
    await schedule.justCalled();
    await options.onTick();
  }

  // Initialize CronJob
  const cronOptions = {
    cronTime: `* */${options.periodMinutes} * * *`,
    onTick,
    waitForCompletion: true,
    start: true,
    runOnInit: true,
  };
  setTimeout(() => CronJob.from(cronOptions), shouldRunInMS);
};

/**
 * METHODS
 */

scheduleSchema.methods.justCalled = async function () {
  this.lastCalledAt = new Date(Date.now());
  await this.save();
};

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
