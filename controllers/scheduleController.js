const AlertModel = require("../models/AlertModel");
const UoftCourseModel = require("../models/Course/UoftCourseModel");
const ScheduleModel = require("../models/ScheduleModel");
const alertsData = require("../data/alerts-data");
const Logger = require("../utils/Logger");
const UoftParallel = require("../utils/Uoft/UoftParallel");

exports.initialize = async () => {
  await ScheduleModel.intializeRecurring("alerts", {
    periodMinutes: alertsData.alertsPeriodMinutes,
    onTick: scheduleAlerts,
  });
};

async function scheduleAlerts() {
  try {
    const currentDate = new Date(Date.now()).toLocaleString("en-US", {
      timeZone: "America/Toronto",
    });
    Logger.info(`(0/7) Starting alert notification process at ${currentDate}.`);

    // 1. Find all active alerts and group then in an object by their code
    const alerts = await AlertModel.findAlertable();
    if (alerts.length === 0) return;
    Logger.info("(1/7) Found all active alerts.");

    // 2. Deactivate alerts with non-enrollable courses
    const enrollableAlerts = await AlertModel.deactivateExpired(alerts);
    Logger.info(`(2/7) Deactivated expired alerts.`);

    // 3. Filter out paused alerts
    const unPausedAlerts = enrollableAlerts.filter((alert) => !alert.isPaused);
    Logger.info("(3/7) Filtering out unpaused alerts.");

    // 4. Fetch updated course data for all the unique courses that have alerts
    const groupedAlertsByCode = AlertModel.groupByCode(unPausedAlerts);
    const courseCodes = Object.keys(groupedAlertsByCode);
    const updatedCoursesByCode = await UoftParallel.fetchAllLambda(courseCodes);
    Logger.info("(4/7) Fetched updated courses.");

    // 5. Filter alerts by whether they have sections freed up and set updated section values (but don't save)
    const filteredAlerts = await AlertModel.filterAllNotifiable(alerts, updatedCoursesByCode);
    Logger.info("(5/7) Filtered non-notifiable alerts.");

    // 6. Notify users of alerts that have sections freed up in parallel
    await AlertModel.notifyAll(filteredAlerts);
    Logger.info("(6/7) Sent notifications for filtered alerts.");

    // 7. Upsert courses and sections with updated data
    const updatedCoursesData = Object.values(updatedCoursesByCode);
    await UoftCourseModel.upsertCoursesAndSections(updatedCoursesData);
    Logger.info("(7/7) Upserted updated course data.");
  } catch (error) {
    Logger.error(`Uoft Schedule Error: ${error.message}`, { error });
  }
}
