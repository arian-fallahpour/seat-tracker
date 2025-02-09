const UoftSection = require("../models/database/uoftSectionModel"); // Required for instance methods
const UoftAdapter = require("../models/api-adapters/UoftAdapter");

exports.processUoftAlert = async (alert, courseCache) => {
  // Get updated version of the course associated with alert, and cache all fetched results
  const updatedCourse = await alert.course.getUpdatedCourse(courseCache);
  if (updatedCourse === null) {
    return console.log(`[ERROR] (Alert: ${alert._id}): Course ${alert.course.code} not found.`);
  }

  // If sections have been freed up, send notification
  const freedSections = await alert.getFreedSections(updatedCourse.sections);
  if (freedSections.length > 0) {
    sendNotification(alert, freedSections, alert.course);
  }
};

function sendNotification(alert, reopenedSections) {
  reopenedSections.forEach((reopenedSection) =>
    console.log(
      `[ALERT] (email: ${alert.email}): Section ${reopenedSection.type} ${reopenedSection.number} in ${alert.course.code} is now open!`
    )
  );
}
