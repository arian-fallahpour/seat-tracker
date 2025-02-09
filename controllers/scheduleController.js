const { Stack } = require("datastructures-js");
const throttledQueue = require("throttled-queue");

const Alert = require("../models/database/alertModel");
const { processUoftAlert } = require("./processorController");

exports.scheduleUoftAlerts = async () => {
  try {
    const alerts = await Alert.findActiveAlerts("uoft");
    if (!alerts) return;

    const alertsStack = new Stack(alerts);
    const updatedCoursesMap = new Map();

    // Process alerts in a throttled manner
    const throttleDelay = Number(process.env.UOFT_ALERTS_THROTTLE_MS);
    const throttle = throttledQueue(1, throttleDelay);
    while (!alertsStack.isEmpty()) {
      await throttle(() => processUoftAlert(alertsStack.pop(), updatedCoursesMap));
    }

    // Update course data from new fetched course data
    console.log("Done processing alerts");
  } catch (err) {
    console.error(`Uoft Schedule Error: ${err.message}`);
  }
};
