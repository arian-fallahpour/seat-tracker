import Alert from "../models/database/Alert.js";
import UoftCourse from "../models/database/Course/UoftCourse.js";
import UoftAdapter from "../models/api-adapters/UoftAdapter.js";
import Schedule from "../models/database/Schedule.js";
import alertsData from "../data/alerts-data.js";

const scheduler = async () => {
  await scheduleAlerts();
  // await Schedule.initRecurringSchedule("alerts", {
  //   periodMinutes: alertsData.alertsPeriodMinutes,
  //   onTick: scheduleAlerts,
  // });
};
export default scheduler;

// TODO: Testing (What if UoftAPI does not find the course? + more)
async function scheduleAlerts() {
  try {
    const alerts = await Alert.findActive();
    if (alerts.length === 0) return;

    const groupedAlerts = Alert.groupByCode(alerts);

    // Get updated course data for each course from API
    const courseCodes = Object.keys(groupedAlerts);
    const updatedCourses = await UoftAdapter.fetchUpdatedCourses(courseCodes);

    await Alert.process(alerts, updatedCourses);

    // Update courses in database with updated data
    const updatedCoursesData = Object.values(updatedCourses);
    await UoftCourse.upsertCoursesAndSections(updatedCoursesData);
  } catch (error) {
    console.error(`[ERROR] Uoft Schedule Error: ${error.message}`);
  }
}
