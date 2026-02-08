import mongoose, { Schema, model } from "mongoose";
import {
  defaultScheduleOptions,
  ScheduleModelType,
  ScheduleOptionsType,
  ScheduleType,
} from "../Types/ModelTypes";

import { CronJob } from "cron";

import Logger from "../utils/Logger";

const scheduleSchema = new Schema({
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

scheduleSchema.statics.intializeRecurring = async function (
  name: string,
  options: ScheduleOptionsType = defaultScheduleOptions,
) {
  if (!options.onTick) {
    throw new Error("Please provide an onTick function for the schedule.");
  }

  let schedule = await this.findOne({ name });
  if (!schedule) schedule = await this.create({ name });
  if (!schedule.enabled) return Logger.info(`Schedule (${schedule.name}) is not enabled`);

  const minutes = `*/${options.periodMinutes}`;
  const hours = options.activeRange ? `${options.activeRange[0]}-${options.activeRange[1]}` : "*";
  const cronOptions = {
    async onTick() {
      await schedule.justCalled();
      await options.onTick();
    },

    cronTime: `0 ${minutes} ${hours} * * *`,
    waitForCompletion: true,
    start: true,
    runOnInit: true,
  };

  let delayMS = 0;
  const earliestCalledAt = new Date(Date.now() - 1000 * 60 * options.periodMinutes);
  if (schedule.lastCalledAt && schedule.lastCalledAt > earliestCalledAt) {
    delayMS = schedule.lastCalledAt.getTime() - earliestCalledAt.getTime();
  }

  setTimeout(() => CronJob.from(cronOptions), delayMS);
};

/**
 * METHODS
 */

scheduleSchema.methods.justCalled = async function () {
  this.lastCalledAt = new Date(Date.now());
  await this.save();
};

const Schedule =
  (mongoose.models.Schedule as ScheduleModelType) ||
  model<ScheduleType, ScheduleModelType>("Schedule", scheduleSchema);

export default Schedule;
