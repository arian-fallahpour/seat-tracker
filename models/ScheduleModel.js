const mongoose = require("mongoose");
const { CronJob } = require("cron");
const Logger = require("../utils/Logger");

const scheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, "Schedule name must be unique"],
    required: [true, "Please provide the schedule name"],
  },
  enabled: {
    type: Boolean,
    required: [true, "Please indicate if this schedule is enabled"],
    default: false,
  },
  lastCalledAt: Date,
});

/**
 * STATICS
 */

scheduleSchema.statics.intializeRecurring = async function (scheduleName, options) {
  if (typeof options.onTick !== "function") {
    throw new Error("Please provide an onTick function");
  }

  options = {
    periodMinutes: options.periodMinutes || 15,
    activeRange: options.activeRange, // [start, end]
    onTick: options.onTick,
  };

  // Find schedule, or create new one if it doesn't exist
  let schedule = await this.findOne({ name: scheduleName });
  if (!schedule) {
    schedule = await this.create({ name: scheduleName });
  } else if (!schedule.enabled) {
    return Logger.info(`Schedule (${schedule.name}) is not enabled`);
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
  const minutes = `*/${options.periodMinutes}`;
  const hours = options.activeRange ? `${options.activeRange[0]}-${options.activeRange[1]}` : "*";
  const cronOptions = {
    cronTime: `0 ${minutes} ${hours} * * *`,
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

const Schedule = mongoose.models?.Schedule || mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
