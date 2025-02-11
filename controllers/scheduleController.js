const { processUoftAlert, processWaterlooAlert } = require("./processorController");
const Alert = require("../models/database/Alert");
const Course = require("../models/database/Course/Course");

exports.scheduleUoftAlerts = async () => {
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
    const updatedCourses = courseCache.values();
    await Course.updateCoursesBulk(updatedCourses);
  } catch (err) {
    console.error(`[ERROR] Uoft Schedule Error: ${err.message}`);
  }
};

exports.scheduleWaterlooAlerts = async () => {
  try {
    // Find all active alerts for waterloo
    const alerts = await Alert.findActiveAlerts("waterloo");
    if (alerts.length === 0) return;

    // Process alerts using waterloo processor
    const courseCache = await Alert.processAlerts(alerts, {
      processor: processWaterlooAlert,
      throttleDelay: process.env.WATERLOO_ALERTS_THROTTLE_MS,
    });

    // Update course data from new fetched course data
    const updatedCourses = courseCache.values();
    await Course.updateCoursesBulk(updatedCourses);
  } catch (err) {
    console.error(`[ERROR] Waterloo Schedule Error: ${err.message}`);
  }
};

exports.scheduleWesternAlerts = async () => {
  try {
  } catch (err) {
    console.error(`[ERROR] Western Schedule Error: ${err.message}`);
  }
};
