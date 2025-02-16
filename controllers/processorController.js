exports.processUoftAlert = async (alert, courseCache) => {
  try {
    // Get updated version of the course associated with alert, and cache all fetched results
    const updatedCourse = await alert.course.getUpdatedCourse(courseCache);
    if (updatedCourse === null) {
      return console.log(`[ERROR] (Alert: ${alert._id}): Course ${alert.course.code} not found.`);
    }

    // Find all sections that have been freed up
    const freedSections = await alert.getFreedSections(updatedCourse.sections);
    if (freedSections.length === 0) return;

    // Send notifications to all sections that are freed up
    await alert.sendAlert(freedSections);
  } catch (err) {
    console.error(`[ERROR] Uoft alert processing error: ${err.message}`);
  }
};
