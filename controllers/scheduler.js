const Alert = require("../models/database/Alert");
const UoftCourse = require("../models/database/Course/UoftCourse");
const UoftAdapter = require("../models/api-adapters/UoftAdapter");
const Schedule = require("../models/database/Schedule");
const alertsData = require("../data/alerts-data");

exports.init = async () => {
  // await scheduleUoftAlerts();
  // await Schedule.initRecurringSchedule("uoft-alerts", {
  //   periodMinutes: alertsData.uoft.alertsPeriodMinutes,
  //   onTick: scheduleUoftAlerts,
  // });
};

// TODO: Testing (What if UoftAPI does not find the course? + more)
async function scheduleUoftAlerts() {
  try {
    // Find all active alerts for uoft
    const alerts = await Alert.findActiveAlerts("uoft");
    if (alerts.length === 0) return;

    // Group alerts by course code in a map
    const groupedAlerts = Alert.groupAlertsByCode(alerts);

    // Get updated course data for each course from API
    const courseCodes = Object.keys(groupedAlerts);
    const updatedCourses = await UoftAdapter.fetchUpdatedCourses(courseCodes);

    // Process alerts
    await Alert.processAlerts(alerts, updatedCourses);

    // Update courses in database with updated data
    const updatedCoursesData = Object.values(updatedCourses);
    await UoftCourse.upsertCoursesAndSections(updatedCoursesData);
  } catch (error) {
    console.error(`[ERROR] Uoft Schedule Error: ${error.message}`);
  }
}
