const { CronJob } = require("cron");
const Alert = require("../models/database/Alert");
const UoftCourse = require("../models/database/Course/UoftCourse");
const UoftAdapter = require("../models/api-adapters/UoftAdapter");

exports.init = async () => {
  await scheduleUoftAlerts();

  // ALERT SCHEDULE: every 15/30 mins
  // UPDATE COURSE SCHEDULE: one of every 2-7 days

  // const uoftAlertsJob = CronJob.from({
  //   cronTime: `* */${process.env.UOFT_ALERTS_PERIOD_MINS} * * * *`,
  //   onTick: scheduleUoftAlerts,
  //   waitForCompletion: true,
  //   start: true,
  // });
};

// TODO: Testing (What if UoftAPI does not find the course? + more)

async function scheduleUoftAlerts() {
  try {
    // Find all active alerts for uoft
    const alerts = await Alert.findActiveAlerts("uoft");
    if (alerts.length === 0) return;

    // Group alerts by course code in a map
    const groupedAlertsMap = Alert.groupAlertsByCode(alerts);

    // Get updated course data for each course from API
    const courseCodes = Array.from(groupedAlertsMap.keys());
    const updatedCoursesMap = await UoftAdapter.fetchUpdatedCourses(courseCodes);

    // Process alerts
    await Alert.processAlerts(alerts, updatedCoursesMap);

    // Update courses in database with updated data
    const updatedCourses = Array.from(updatedCoursesMap.values());
    await UoftCourse.upsertCoursesAndSections(updatedCourses);
  } catch (err) {
    console.error(`[ERROR] Uoft Schedule Error: ${err.message}`);
  }
}
