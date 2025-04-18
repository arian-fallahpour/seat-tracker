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
    Logger.info(`(0/5) Starting alert notification process at ${new Date(Date.now())}`);

    // 1. Find all active alerts and group then in an object by their code
    const alerts = await AlertModel.findActive();
    if (alerts.length === 0) return;
    Logger.info("(1/5) Found all active alerts.");

    // 2. Fetch updated course data for all the unique courses that have alerts
    const groupedAlertsByCode = AlertModel.groupByCode(alerts);
    const courseCodes = Object.keys(groupedAlertsByCode);
    const updatedCoursesByCode = await UoftParallel.fetchAllLambda(courseCodes);
    Logger.info("(2/5) Fetched updated courses.");

    // 3. Filter alerts by whether they have sections freed up and set updated section values (but don't save)
    const filteredAlerts = await AlertModel.filterAllNotifiable(alerts, updatedCoursesByCode);
    Logger.info("(3/5) Filtered alerts by number of freed sections.");

    // 4. Notify users of alerts that have sections freed up in parallel
    await AlertModel.notifyAll(filteredAlerts);
    Logger.info("(4/5) Sent notifications for filtered alerts.");

    // 5. Upsert courses and sections with updated data
    const updatedCoursesData = Object.values(updatedCoursesByCode);
    await UoftCourseModel.upsertCoursesAndSections(updatedCoursesData);
    Logger.info("(5/5) Upserted updated course data.");
  } catch (error) {
    console.error(`[ERROR] Uoft Schedule Error: ${error.message}`);
  }
}
