const axios = require("axios");

const url = "https://api.easi.utoronto.ca/ttb/getPageableCourses";

class UoftAdapter {
  static async fetchCourses({ query = "", page = 1 }) {
    try {
      const response = await axios({
        url,
        method: "POST",
        data: getBody({ query, page }),
      });

      const data = response.data.payload.pageableCourse;

      const formattedCourses = this.formatCourses(data.courses);
      return formattedCourses;
    } catch (err) {
      throw err;
    }
  }

  static formatCourses(courses) {
    const formattedCourses = [];
    for (const course of courses) {
      const formattedSections = this.formatSections(course.sections);
      formattedCourses.push({
        name: course.name,
        code: course.code,
        campus: course.campus,
        sections: formattedSections,
      });
    }
    return formattedCourses;
  }

  static formatSections(sections) {
    const formattedSections = [];
    for (const section of sections) {
      formattedSections.push({
        type: section.teachMethod,
        number: section.sectionNumber,
        seatsTaken: section.currentEnrolment,
        seatsTotal: section.maxEnrolment,
        seatsAvailable: section.maxEnrolment - section.currentEnrolment,
        hasWaitlist: section.waitlistInd === "Y" ? true : false,
        waitlistCount: section.currentWaitlist,
      });
    }
    return formattedSections;
  }
}

function getBody(data) {
  return {
    courseCodeAndTitleProps: {
      courseCode: "",
      courseTitle: data.query,
      courseSectionCode: "",
      searchCourseDescription: true, // Turn on for search
    },
    departmentProps: [],
    campuses: [],
    sessions: ["20249", "20251", "20249-20251"],
    requirementProps: [],
    instructor: "",
    courseLevels: [],
    deliveryModes: [],
    dayPreferences: [],
    timePreferences: [],
    divisions: [
      "APSC",
      "ARTSC",
      "FIS",
      "FPEH",
      "MUSIC",
      "ARCLA",
      "ERIN",
      "SCAR",
    ],
    creditWeights: [],
    availableSpace: false,
    waitListable: false,
    page: data.page,
    pageSize: 20,
    direction: "asc",
  };
}

module.exports = UoftAdapter;
