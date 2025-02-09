const { processUoftAlert } = require("./processorController");
const Alert = require("../models/database/alertModel");
const Course = require("../models/database/courseModel");

exports.scheduleUoftAlerts = async () => {
  try {
    const alerts = await Alert.findActiveAlerts("uoft");
    if (alerts.length === 0) return;

    // Process alerts using Uoft processor
    const courseCache = await Alert.processAlerts(alerts, {
      processor: processUoftAlert,
      throttleDelay: process.env.UOFT_ALERTS_THROTTLE_MS,
    });
    console.log("Done processing alerts");

    // Update course data from new fetched course data
    const updatedCourses = courseCache.values();
    await Course.updateCourses(updatedCourses);
  } catch (err) {
    console.error(`Uoft Schedule Error: ${err.message}`);
  }
};
