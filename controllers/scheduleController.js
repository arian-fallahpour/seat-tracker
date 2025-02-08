const cron = require("node-cron");
const fs = require("fs/promises");
const UoftAdapter = require("../Models/api-adapters/UoftAdapter");

module.exports = () => {
  // UOFT Seat Alerts
  const uoftScheduleTiming =
    process.env.NODE_ENV === "development"
      ? `*/${process.env.UOFT_ALERTS_PERIOD_MINUTES} * * * * *`
      : `* */${process.env.UOFT_ALERTS_PERIOD_MINUTES} * * * *`;
  cron.schedule(uoftScheduleTiming, scheduleUoftAlerts);
};

async function scheduleUoftAlerts() {
  try {
    // 1. Find all alerts that haven't been alert in a 1 hour timeframe, sorted by course name and code
    // 2. Add every alert to a stack
    // 3. For every alert, first check if we already queried course, otherwise fetch courses associated with it
    // 4. Send alert to user's email if
    // 4. Add fetched courses to a map to check in future

    console.log("QUERYING UOFT API");
    const courses = await UoftAdapter.fetchCourses({
      query: "pcl",
      page: 2,
    });

    for (let i = 0; i < courses.length; i++) {
      await fs.writeFile(
        `./data/uoft/courses/${courses[i].code}.json`,
        JSON.stringify(courses[i]),
        "utf8"
      );
    }
  } catch (err) {
    throw err;
  }
}
