const Logger = require("../../utils/Logger");
const UoftParallel = require("../../utils/Uoft/UoftParallel");
const AlertModel = require("../../models/AlertModel");
const UoftCourseModel = require("../../models/Course/UoftCourseModel");
const UoftSectionModel = require("../../models/Section/UoftSectionModel");

exports.task = async function uoftScheduleController() {
  let i = 1;

  try {
    Logger.info(`${i++}. Starting alert notification process at ${getLocalDate()}.`);

    const activeAlerts = await getActiveAlerts();
    if (activeAlerts.length === 0) return Logger.info("No active alerts found. Stopping schedule.");
    Logger.info(`${i++}. Found all active alerts.`);

    const validAlerts = await filterDeactivatedAlerts(activeAlerts);
    if (validAlerts.length === 0) return Logger.info("No valid alerts found. Stopping schedule.");
    Logger.info(`${i++}. Deactivated expired alerts.`);

    const unPausedAlerts = filterPausedAlerts(validAlerts);
    if (unPausedAlerts.length === 0)
      return Logger.info("No unpaused alerts found. Stopping schedule.");
    Logger.info(`${i++}. Filtered out paused alerts.`);

    // TEST
    // unPausedAlerts[0].sections[0].seatsTaken = unPausedAlerts[0].sections[0].seatsAvailable;
    // unPausedAlerts[0].sections[1].seatsTaken = unPausedAlerts[0].sections[1].seatsAvailable - 1;
    // console.log("DATABASE: ", unPausedAlerts[0].sections[0], unPausedAlerts[0].sections[1]);

    const groupedAlertsByCode = groupAlertsByCourseCode(unPausedAlerts);
    const courseCodes = Object.keys(groupedAlertsByCode);
    const updatedCoursesByCode = await UoftParallel.fetchAllLambda(courseCodes);
    Logger.info(`${i++}. Fetched updated courses.`);

    // TEST
    // const testSection = updatedCoursesByCode["MAT224H1 S"].sections.find(
    //   (s) =>
    //     s.type === unPausedAlerts[0].sections[1].type &&
    //     s.number === unPausedAlerts[0].sections[1].number
    // );
    // testSection.seatsTaken = testSection.seatsAvailable;

    // console.log(
    //   "UPDATED: ",
    //   updatedCoursesByCode["MAT224H1 S"].sections.find(
    //     (s) =>
    //       s.type === unPausedAlerts[0].sections[0].type &&
    //       s.number === unPausedAlerts[0].sections[0].number
    //   ),
    //   updatedCoursesByCode["MAT224H1 S"].sections.find(
    //     (s) =>
    //       s.type === unPausedAlerts[0].sections[1].type &&
    //       s.number === unPausedAlerts[0].sections[1].number
    //   )
    // );

    const notifiableAlerts = await filterNotifiableAlerts(unPausedAlerts, updatedCoursesByCode);
    console.log(notifiableAlerts);
    Logger.info(`${i++}. Filtered alerts with opened sections.`);

    await notifyAlerts(notifiableAlerts);
    Logger.info(`${i++}. Sent notifications for filtered alerts.`);

    const oldCoursesByCode = groupAlertCoursesByCode(unPausedAlerts);
    const upsertableCourses = filterCoursesByStateChange(oldCoursesByCode, updatedCoursesByCode);
    if (upsertableCourses.length === 0)
      return Logger.info("No courses changed fill state. Stopping schedule.");

    await upsertIteratively(oldCoursesByCode, upsertableCourses);
    Logger.info(`${i++}. Upserted courses that changed fill state.`);
  } catch (error) {
    Logger.error(`Uoft Schedule Error: ${error.message}`, { error });
  }
};

exports.getLocalDate = getLocalDate;
function getLocalDate() {
  return new Date(Date.now()).toLocaleString("en-US", { timeZone: "America/Toronto" });
}

exports.getActiveAlerts = getActiveAlerts;
async function getActiveAlerts() {
  const alerts = await AlertModel.find({ status: "active" })
    .populate({ path: "course" })
    .populate({ path: "sections" });

  return alerts.filter((a) => a.course !== null);
}

exports.filterDeactivatedAlerts = filterDeactivatedAlerts;
async function filterDeactivatedAlerts(alerts = []) {
  const activeAlerts = [];

  const promises = alerts.map(async (alert) => {
    if (!alert.course.isEnrollable()) {
      return await alert.deactivate();
    }

    activeAlerts.push(alert);
  });
  await Promise.allSettled(promises);

  return activeAlerts;
}

exports.filterPausedAlerts = filterPausedAlerts;
function filterPausedAlerts(alerts = []) {
  return alerts.filter((alert) => !alert.isPaused);
}

exports.groupAlertsByCourseCode = groupAlertsByCourseCode;
function groupAlertsByCourseCode(alerts = []) {
  const groupedAlerts = {};

  for (const alert of alerts) {
    if (!alert.course || !alert.course.code) continue;
    if (!groupedAlerts[alert.course.code]) {
      groupedAlerts[alert.course.code] = [];
    }

    groupedAlerts[alert.course.code].push(alert);
  }

  return groupedAlerts;
}

exports.filterNotifiableAlerts = filterNotifiableAlerts;
async function filterNotifiableAlerts(alerts = [], updatedCoursesByCode = {}) {
  const notifiableAlerts = [];

  const promises = alerts.map(async (alert) => {
    if (!alert.course || !alert.course.code) return;

    const updatedCourse = updatedCoursesByCode[alert.course.code];
    if (!updatedCourse) return;

    const openedSections = await alert.getOpenedSections(updatedCourse);
    if (openedSections.length === 0) return;
    console.log(openedSections);

    alert.freedSections = openedSections;
    notifiableAlerts.push(alert);
  });
  await Promise.allSettled(promises);

  return notifiableAlerts;
}

exports.notifyAlerts = notifyAlerts;
async function notifyAlerts(alerts = []) {
  const promises = alerts.map(async (alert) => await alert.notify());
  await Promise.allSettled(promises);
}

exports.groupAlertCoursesByCode = groupAlertCoursesByCode;
function groupAlertCoursesByCode(alerts = []) {
  const courses = {};

  for (const alert of alerts) {
    if (!alert.course.code) continue;

    courses[alert.course.code] = alert.course.toObject();
    courses[alert.course.code].sections = alert.sections;
  }

  return courses;
}

exports.groupSectionsByCode = groupSectionsByCode;
function groupSectionsByCode(sections = []) {
  const groupedSections = {};

  for (const section of sections) {
    if (!section.type || !section.number) continue;

    groupedSections[section.type + section.number] = section;
  }

  return groupedSections;
}

exports.filterCoursesByStateChange = filterCoursesByStateChange;
function filterCoursesByStateChange(oldCoursesByCode = {}, updatedCoursesByCode = {}) {
  const filteredCourses = {};

  for (const oldCourse of Object.values(oldCoursesByCode)) {
    const updatedCourse = updatedCoursesByCode[oldCourse.code];
    if (!updatedCourse) continue;

    const updatedSectionsByCode = groupSectionsByCode(updatedCourse.sections);

    const filteredSections = [];
    for (const oldSection of oldCourse.sections) {
      const updatedSection = updatedSectionsByCode[oldSection.type + oldSection.number];
      if (!updatedSection) continue;

      if (oldSection.hasOpened(updatedSection) || oldSection.hasFilled(updatedSection)) {
        filteredSections.push(updatedSection);
      }
    }

    if (filteredSections.length > 0) {
      filteredCourses[oldCourse.code] = updatedCourse;
      filteredCourses[oldCourse.code].sections = filteredSections;
    }
  }

  return Object.values(filteredCourses);
}

exports.upsertIteratively = upsertIteratively;
async function upsertIteratively(oldCoursesByCode = {}, upsertableCourses = []) {
  let i = 0;
  const upsert = 50;
  while (i < upsertableCourses.length) {
    const max = Math.min(i + upsert, upsertableCourses.length);
    Logger.info(`Upserting upsertableCourses ${i + 1} to ${max}`);

    const updatedCourses = upsertableCourses.slice(i, max);
    // console.log("UPSERTING COURSES: ", updatedCourses);
    await upsertCourses(updatedCourses);

    const updatedSections = [];
    for (const c of updatedCourses) {
      updatedSections.push(
        ...c.sections.map((s) => ({ ...s, course: oldCoursesByCode[c.code].id }))
      );
    }
    // console.log("UPDATING SECTIONS: ", updatedSections);
    await upsertSections(updatedSections);

    i += upsert;
  }
}

async function upsertCourses(upsertableCourses = []) {
  const bulkOperations = [];

  for (const updatedCourse of upsertableCourses) {
    const filter = { code: updatedCourse.code };
    const update = { ...updatedCourse };
    delete update.sections;

    bulkOperations.push({ updateOne: { filter, update, upsert: true } });
  }

  if (bulkOperations.length === 0) return;
  await UoftCourseModel.bulkWrite(bulkOperations);
}

async function upsertSections(upsertableSections = []) {
  const bulkOperations = [];

  for (const updatedSection of upsertableSections) {
    const filter = {
      course: updatedSection.course,
      type: updatedSection.type,
      number: updatedSection.number,
    };

    bulkOperations.push({ updateOne: { filter, update: updatedSection, upsert: true } });
  }

  if (bulkOperations.length === 0) return;
  await UoftSectionModel.bulkWrite(bulkOperations);
}
