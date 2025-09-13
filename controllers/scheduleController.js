const AlertModel = require("../models/AlertModel");
const UoftCourseModel = require("../models/Course/UoftCourseModel");
const ScheduleModel = require("../models/ScheduleModel");
const alertsData = require("../data/alerts-data");
const Logger = require("../utils/Logger");
const UoftParallel = require("../utils/Uoft/UoftParallel");

/**
 * TODO:
 * - Add caching to furthr reduce database requests by storing active alerts? is this possible if a new active alert is created?
 * - refactor to make more readable
 * - test
 * - add quick link to pause alert in email
 */

exports.initialize = async () => {
  await ScheduleModel.intializeRecurring("alerts", {
    periodMinutes: alertsData.alertsPeriodMinutes,
    onTick: scheduleAlerts,
  });
};

exports.scheduleAlerts = scheduleAlerts;
async function scheduleAlerts() {
  try {
    const timeZone = "America/Toronto";
    const currentDate = new Date(Date.now()).toLocaleString("en-US", { timeZone });
    Logger.info(`(0/7) Starting alert notification process at ${currentDate}.`);

    // 1. Find all active alerts and group then in an object by their code
    const alerts = await AlertModel.findAlertable();
    if (alerts.length === 0) return;
    Logger.info("(1/7) Found all active alerts.");

    // 2. Deactivate alerts with non-enrollable courses
    const enrollableAlerts = await AlertModel.deactivateExpired(alerts);
    if (enrollableAlerts.length === 0) return;
    Logger.info(`(2/7) Deactivated expired alerts.`);

    // 3. Filter out paused alerts
    const unPausedAlerts = enrollableAlerts.filter((alert) => !alert.isPaused);
    if (unPausedAlerts.length === 0) return;
    Logger.info("(3/7) Filtering out unpaused alerts.");

    // 4. Fetch updated course data for all the unique courses that have alerts
    const groupedAlertsByCode = AlertModel.groupByCode(unPausedAlerts);
    const courseCodes = Object.keys(groupedAlertsByCode);
    const updatedCoursesByCode = await UoftParallel.fetchAllLambda(courseCodes);
    Logger.info("(4/7) Fetched updated courses.");

    // 5. Filter alerts by whether they have sections freed up and set updated section values (but don't save)
    const notifiableAlerts = await AlertModel.filterAllNotifiable(alerts, updatedCoursesByCode);
    Logger.info("(5/7) Filtered non-notifiable alerts.");

    // 6. Notify users of alerts that have sections freed up in parallel
    await AlertModel.notifyAll(notifiableAlerts);
    Logger.info("(6/7) Sent notifications for filtered alerts.");

    // 7. Upsert courses and sections with updated data
    const oldCoursesByCode = groupOldCoursesByCode(unPausedAlerts);
    const filteredCoursesData = AlertModel.filterCoursesByStatus(
      oldCoursesByCode,
      updatedCoursesByCode
    );
    await upsertIteratively(filteredCoursesData);
    Logger.info("(7/7) Upserted updated course data.");
  } catch (error) {
    Logger.error(`Uoft Schedule Error: ${error.message}`, { error });
  }
}

function groupOldCoursesByCode(alerts) {
  const oldCoursesByCode = {};
  alerts.forEach((alert) => {
    oldCoursesByCode[alert.course.code] = alert.course.toObject();
    oldCoursesByCode[alert.course.code].sections = alert.sections;
  });
  return oldCoursesByCode;
}

async function upsertIteratively(filteredCoursesData) {
  let i = 0;
  const upsert = 50; // Number of courses to upsert at a time
  while (i < filteredCoursesData.length) {
    const max = Math.min(i + upsert, filteredCoursesData.length);

    console.log(`[INFO] Upserting courses ${i + 1} to ${max}`);
    await UoftCourseModel.upsertCoursesAndSections(filteredCoursesData.slice(i, max));
    i += upsert;
  }
}
