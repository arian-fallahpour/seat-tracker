const ScheduleModel = require("../../models/ScheduleModel");
const alertsData = require("../../data/alerts-data");
const uoftScheduleController = require("./uoftScheduleController");

/**
 * TODO:
 * - Add caching to furthr reduce database requests by storing active alerts? is this possible if a new active alert is created?
 * - test
 * - add quick link to pause alert in email template
 * - determine why isPaused: true alerts are being notified
 * - add rate limit to emails? maybe
 * - fix verification code validation
 */

exports.initialize = async () => {
  await ScheduleModel.intializeRecurring("alerts", {
    periodMinutes: alertsData.alertsPeriodMinutes,
    onTick: uoftScheduleController.task,
  });
};
