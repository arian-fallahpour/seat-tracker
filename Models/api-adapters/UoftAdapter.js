const axios = require("axios");

const getCoursesURL = "https://api.easi.utoronto.ca/ttb/getPageableCourses";

class UoftAdapter {
  static async getCourses({ query = "", page = 1 }) {
    const { data } = await axios({
      url: getCoursesURL,
      method: "POST",
      data: this.getBody({ query, page }),
    });

    const coursesData = data.payload.pageableCourse.courses;
    const courses = coursesData.map((courseData) =>
      this.formatCourse(courseData)
    );

    return courses;
  }

  static formatCourse(courseData) {
    const sections = courseData.sections.map((sectionData) =>
      this.formatSection({ ...sectionData, campus: courseData.campus })
    );

    return {
      school: "uoft",
      name: courseData.name,
      code: `${courseData.code} ${courseData.sectionCode}`,
      sections,
    };
  }

  static formatSection(sectionData) {
    return {
      type: sectionData.teachMethod === "TUT" ? "tutorial" : "lab",
      number: sectionData.sectionNumber,
      campus: sectionData.campus,
      seatsTaken: sectionData.currentEnrolment,
      seatsAvailable: sectionData.maxEnrolment,
      hasWaitlist: sectionData.waitlistInd === "Y" ? true : false,
      waitlist: sectionData.currentWaitlist,
    };
  }

  static getBody({ query = "", page = 1 }) {
    return {
      courseCodeAndTitleProps: {
        courseCode: "",
        courseTitle: query,
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
      page,
      pageSize: 20,
      direction: "asc",
    };
  }
}

module.exports = UoftAdapter;
