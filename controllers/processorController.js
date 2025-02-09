const UoftSection = require("../models/database/uoftSectionModel"); // Required for instance methods
const UoftAdapter = require("../models/api-adapters/UoftAdapter");

exports.processUoftAlert = async (alert, updatedCoursesMap) => {
  const { course } = alert;

  let updatedCourse;

  // Get updated version of the course associated with alert
  try {
    const alreadyFoundUpdatedCourse = updatedCoursesMap.has(course.code);
    if (alreadyFoundUpdatedCourse) {
      updatedCourse = updatedCoursesMap.get(course.code);
    } else {
      const adapterOptions = { query: course.code };
      const updatedCourses = await UoftAdapter.getCourses(adapterOptions);
      updatedCourse = findAndCacheCourse(updatedCourses, course, updatedCoursesMap);
    }
  } catch (err) {
    console.log(`[ERROR] Alert's course not found: ${err.message}`);
    return;
  }

  // Populate only the course sections that might be alerted
  await course.populate({
    path: "sections",
    match: {
      _id: { $in: alert.sections },
    },
  });
  const alertableSections = course.sections;

  // Filter alertable sections that just re-opened any seats
  const reopenedSections = alertableSections.filter((alertableSection) => {
    const updatedSection = findUpdatedSection(updatedCourse.sections, alertableSection);
    return alertableSection.haveSeatsReopened(updatedSection);
  });

  // If there are any alertable sections, send notification
  if (reopenedSections.length > 0) {
    sendNotification(alert, reopenedSections, course);
  }
};

function sendNotification(alert, reopenedSections, course) {
  reopenedSections.forEach((reopenedSection) =>
    console.log(
      `[ALERT] (${alert.email}): Section ${reopenedSection.type} ${reopenedSection.number} in ${course.code} is now open!`
    )
  );
}

function findAndCacheCourse(updatedCourses, alertCourse, updatedCoursesMap) {
  let targetCourse = null;

  updatedCourses.forEach((updatedCourse) => {
    if (updatedCourse.code === alertCourse.code) {
      targetCourse = updatedCourse;
    }

    const notAlreadyFetchedCourse = !updatedCoursesMap.has(updatedCourse.code);
    if (notAlreadyFetchedCourse) {
      updatedCoursesMap.set(updatedCourse.code, updatedCourse);
    }
  });

  if (targetCourse === null) {
    throw new Error(`Course ${alertCourse.code} not found.`);
  }

  return targetCourse;
}

function findUpdatedSection(sections, alertableSection) {
  return sections.find((s) => s.type === alertableSection.type && s.number === alertableSection.number);
}
