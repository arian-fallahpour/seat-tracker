const { CronJob } = require("cron");
const Alert = require("../models/database/Alert");
const UoftCourse = require("../models/database/Course/UoftCourse");
const { processUoftAlert } = require("./processorController");

exports.init = () => {
  const uoftAlertsJob = CronJob.from({
    cronTime: `* */${process.env.UOFT_ALERTS_PERIOD_MINS} * * * *`,
    onTick: scheduleUoftAlerts,
    waitForCompletion: true,
    start: true,
  });
};

async function scheduleUoftAlerts() {
  try {
    // Find all active alerts for uoft
    const alerts = await Alert.findActiveAlerts("uoft");
    if (alerts.length === 0) return;

    // Process alerts using Uoft processor
    const courseCache = await Alert.processAlerts(alerts, {
      processor: processUoftAlert,
      throttleDelay: process.env.UOFT_ALERTS_THROTTLE_MS,
    });

    // Update course data from new fetched course data
    const updatedCourses = Array.from(courseCache.values());
    await UoftCourse.upsertCoursesAndSections(updatedCourses);
  } catch (err) {
    console.error(`[ERROR] Uoft Schedule Error: ${err.message}`);
  }
}
